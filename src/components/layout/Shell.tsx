import React from 'react';
import { BackgroundCanvas } from '../common/BackgroundCanvas';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative selection:bg-cyan-500/30 selection:text-cyan-600 dark:selection:text-cyan-200">
      {/* Interactive Background Particle & Laser Grid Canvas */}
      <BackgroundCanvas />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 z-10 relative">
        {children}
      </main>
    </div>
  );
};
