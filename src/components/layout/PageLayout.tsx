import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className={cn('flex-1 overflow-y-auto p-8', className)}>
        {children}
      </main>
    </div>
  );
} 