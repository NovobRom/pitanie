'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { DiaryProvider } from '@/context/DiaryContext';
import { Header } from '@/components/Header';
import { NavBar } from '@/components/NavBar';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#fafaf7] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <ProfileProvider>
      <DiaryProvider>
        <div className="min-h-screen bg-[#fafaf7] text-[var(--color-text)] pb-24">
          <main className="p-4 md:p-6 max-w-4xl mx-auto">
            <Header user={user} onOpenProfile={() => router.push('/profile')} />
            <div className="space-y-6">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </main>
          <NavBar />
        </div>
      </DiaryProvider>
    </ProfileProvider>
  );
}
