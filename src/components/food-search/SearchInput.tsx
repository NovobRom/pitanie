import React from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface SearchInputProps {
  query: string;
  setQuery: (q: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function SearchInput({
  query,
  setQuery,
  onSearch,
  isLoading,
  inputRef,
}: SearchInputProps) {
  const { t } = useI18n();

  return (
    <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          placeholder={t('diary.searchPlaceholder') || 'Search for food...'}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all shadow-sm"
        />
      </div>
      <button
        onClick={onSearch}
        disabled={isLoading || !query.trim()}
        className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-2xl transition-all shadow-[var(--shadow-sm)] shrink-0 cursor-pointer"
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : t('build.find') || 'Find'}
      </button>
    </div>
  );
}
