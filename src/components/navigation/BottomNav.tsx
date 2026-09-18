'use client';

import React from 'react';
import { 
  Calendar, 
  CalendarDays, 
  BookOpen, 
  Users, 
  MessageSquare, 
  ShoppingBag, 
  Sparkles 
} from 'lucide-react';
import type { NavigationTab } from '@/components/navigation/PillNavbar';

interface BottomNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onOpenAi: () => void;
}

interface NavItem {
  tab: NavigationTab;
  label: string;
  icon: React.ReactNode;
  dotColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  { tab: 'today',       label: 'Hoy',         icon: <Calendar className="h-5 w-5" /> },
  { tab: 'weekly',      label: 'Horario',      icon: <CalendarDays className="h-5 w-5" /> },
  { tab: 'courses',     label: 'Cursos',       icon: <BookOpen className="h-5 w-5" /> },
  { tab: 'networking',  label: 'Network',      icon: <Users className="h-5 w-5" />, dotColor: 'var(--accent-emerald)' },
  { tab: 'community',   label: 'Comunidad',    icon: <MessageSquare className="h-5 w-5" /> },
  { tab: 'marketplace', label: 'Servicios',    icon: <ShoppingBag className="h-5 w-5" /> },
];

/**
 * BottomNav — Mobile-only persistent bottom navigation bar.
 *
 * - Renders ONLY on screens < md (hidden md:hidden).
 * - Fixed at the bottom with safe-area padding for notched phones.
 * - To add a new section: add a new entry to NAV_ITEMS above — zero JSX changes needed.
 */
export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onOpenAi }) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-[#121215]/95 backdrop-blur-xl border-t border-white/10 pb-safe flex items-stretch shadow-2xl">
      {NAV_ITEMS.map(({ tab, label, icon, dotColor }) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            aria-label={label}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-all active:scale-95 ${
              isActive ? 'text-white font-bold' : 'text-neutral-500 hover:text-neutral-300 font-medium'
            }`}
          >
            <div className="relative">
              {dotColor && (
                <span
                  className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: dotColor }}
                />
              )}
              {icon}
            </div>
            <span className="text-[10px] leading-none tracking-tight">{label}</span>
            {isActive ? (
              <span className="h-0.5 w-4 rounded-full bg-orange-500" />
            ) : (
              <span className="h-0.5 w-4 rounded-full bg-transparent" />
            )}
          </button>
        );
      })}

      {/* IA Copiloto button — always at the end */}
      <button
        onClick={onOpenAi}
        aria-label="Copiloto IA"
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-lime-400 hover:text-white transition-all active:scale-95"
      >
        <Sparkles className="h-5 w-5" />
        <span className="text-[10px] font-bold leading-none tracking-tight">IA</span>
        <span className="h-0.5 w-4 rounded-full bg-transparent" />
      </button>
    </nav>
  );
};
