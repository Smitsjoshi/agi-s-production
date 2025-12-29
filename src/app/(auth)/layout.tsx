import { ReactNode } from 'react';
import { Logo } from '@/components/logo';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2">
        <Logo className="h-10 w-10" />
        <span className="text-2xl font-bold">AGI-S</span>
      </div>
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
        {children}
      </div>
    </div>
  );
}
