import React from 'react';
import { clsx } from 'clsx';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <section
    className={clsx(
      'bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800',
      className
    )}
  >
    {children}
  </section>
);

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={clsx('px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3', className)}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; icon?: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <h3 className={clsx('text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2', className)}>
    
    {children}
  </h3>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={clsx('p-5', className)}>{children}</div>;
