import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.fallback) {
        return this.fallback;
      }
      return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <div className="glass-card rounded-3xl p-8 max-w-sm text-center border border-red-100/50 shadow-sm animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="font-bold text-sm text-[var(--color-text)] mb-2">
              Что-то пошло не так
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-5">
              При загрузке этого компонента произошла ошибка. Пожалуйста, попробуйте обновить страницу.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-bold px-4 py-2 rounded-xl btn-interactive cursor-pointer"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  private get fallback() {
    return this.props.fallback;
  }
}
