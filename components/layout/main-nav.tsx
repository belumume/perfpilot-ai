// components/layout/main-nav.tsx
import Link from "next/link";
import { Gauge } from 'lucide-react';

export function MainNav() {
  return (
    <div className="flex items-center gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Gauge className="h-6 w-6" />
        <span className="font-bold inline-block">PerfPilot AI</span>
      </Link>
      <nav className="flex gap-6">
        <Link
          href="/"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Dashboard
        </Link>
        <Link
          href="/analyze"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Analyze
        </Link>
        <Link
          href="/about"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          About
        </Link>
      </nav>
    </div>
  );
}