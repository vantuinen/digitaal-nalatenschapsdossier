"use client";
import { Bell, HelpCircle } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="h-14 border-b border-ink-100 bg-white/80 backdrop-blur-sm sticky top-0 z-30 flex items-center px-8 gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-ink-900 truncate font-serif">{title}</h1>
        {subtitle && <p className="text-xs text-ink-500 truncate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <button className="p-1.5 rounded-lg text-ink-400 hover:text-ink-600 hover:bg-ink-100 transition-colors">
          <HelpCircle className="h-4 w-4" />
        </button>
        <button className="p-1.5 rounded-lg text-ink-400 hover:text-ink-600 hover:bg-ink-100 transition-colors relative">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
