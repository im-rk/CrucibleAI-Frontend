import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

// Plain text labels with a tinted background; colour only carries meaning (status), not decoration.
const VARIANTS = {
  cyan: 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  indigo: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  emerald: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'slate', size = 'md', icon, className }) => (
  <span
    className={clsx(
      'inline-flex items-center gap-1.5 rounded-sm font-medium',
      size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-sm',
      VARIANTS[variant],
      className
    )}
  >
    {icon && <span className="shrink-0">{icon}</span>}
    {children}
  </span>
);
