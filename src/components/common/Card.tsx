import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, glow = false }) => {
  return (
    <div
      className={clsx(
        'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-lg dark:shadow-2xl overflow-hidden transition-all duration-300',
        glow && 'border-cyan-500/50 glow-cyan shimmer-border',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={clsx('px-5 py-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between', className)}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; icon?: React.ReactNode; className?: string }> = ({
  children,
  icon,
  className,
}) => (
  <h3 className={clsx('text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-sans', className)}>
    {icon && <span className="text-cyan-600 dark:text-cyan-400">{icon}</span>}
    {children}
  </h3>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={clsx('p-5', className)}>{children}</div>;
