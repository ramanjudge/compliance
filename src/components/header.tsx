import Link from 'next/link';
import { ShieldAlert } from '@/components/icons';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center space-x-2">
          <ShieldAlert className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg tracking-tight">India Wage Tracker</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground">
              Dashboard
            </Link>
            <Link href="/states" className="transition-colors hover:text-foreground/80 text-foreground/60">
              States
            </Link>
            <Link href="/calculator" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Calculator
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
