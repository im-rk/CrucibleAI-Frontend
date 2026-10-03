import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  isOnline: boolean;
  onOpenTools: () => void;
  onNewResearch: () => void;
  onOpenCommandPalette: () => void;
  hasActiveResearch: boolean;
}

const linkClass =
  'text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 underline-offset-4 hover:underline';

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  onOpenTools,
  onNewResearch,
  onOpenCommandPalette,
  hasActiveResearch,
}) => {
  const { mode, toggleMode } = useTheme();

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">CrucibleAI</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Literature search, property screening and hypotheses for materials research.
        </p>
      </div>

      <nav className="flex flex-wrap items-center gap-x-5 gap-y-1" aria-label="Main">
        <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <span
            className={`inline-block w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-600' : 'bg-rose-600'}`}
            aria-hidden
          />
          {isOnline ? 'Backend connected' : 'Backend not reachable'}
        </span>
        {hasActiveResearch && (
          <button onClick={onNewResearch} className={linkClass}>
            New goal
          </button>
        )}
        <button onClick={onOpenTools} className={linkClass}>
          Lookup &amp; predict
        </button>
        <button onClick={onOpenCommandPalette} className={linkClass} title="Open the command menu (Ctrl+K)">
          Commands <kbd className="font-mono text-xs text-slate-500">Ctrl K</kbd>
        </button>
        <button
          onClick={toggleMode}
          className="p-1.5 rounded text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} theme`}
        >
          {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </nav>
    </header>
  );
};
