import React, { useState, useEffect } from 'react';
import { Search, Info, Moon, Sun, Download, Wrench, X } from 'lucide-react';
import { PRESET_QUERIES } from '../../utils/constants';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onSelectQuery: (query: string) => void;
  onOpenTools: () => void;
  onToggleTheme: () => void;
  onExportMarkdown?: () => void;
  onExportJSON?: () => void;
  isDarkMode: boolean;
  hasResults: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpen,
  onSelectQuery,
  onOpenTools,
  onToggleTheme,
  onExportMarkdown,
  onExportJSON: _onExportJSON,
  isDarkMode,
  hasResults,
}) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onOpen();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onOpen]);

  if (!isOpen) return null;

  const filteredPresets = PRESET_QUERIES.filter(
    (q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.query.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 dark:bg-slate-950/80 flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden font-sans text-slate-900 dark:text-slate-100">
        {/* Search Bar */}
        <div className="relative flex items-center border-b border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-slate-950/80">
          <Search className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mr-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands and example goals"
            autoFocus
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-sans"
          />
          <button
            onClick={() => {
              onClose();
            }}
            className="text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Menu Options */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1 text-xs">
          <div className="px-3 py-1.5 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
            Actions
          </div>

          <button
            onClick={() => {
              onToggleTheme();
              onClose();
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
              <span>Toggle Workspace Theme ({isDarkMode ? 'Light Mode' : 'Dark Mode'})</span>
            </div>
            <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
              Theme
            </span>
          </button>

          <button
            onClick={() => {
              onOpenTools();
              onClose();
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Wrench className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Open lookup & predict</span>
            </div>
            <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
              Tools
            </span>
          </button>

          {hasResults && onExportMarkdown && (
            <button
              onClick={() => {
                onExportMarkdown();
                onClose();
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Export Research Report as Markdown (.md)</span>
              </div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Export
              </span>
            </button>
          )}

          <div className="px-3 py-1.5 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold pt-2">
            Example goals
          </div>

          {filteredPresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectQuery(preset.query);
                onClose();
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5 truncate pr-2">
                <Info className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span className="truncate group-hover:text-slate-900 dark:group-hover:text-slate-100">{preset.title}</span>
              </div>
              <span className="text-[10px] text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-200 dark:border-cyan-900 shrink-0 font-semibold">
                {preset.category}
              </span>
            </button>
          ))}
        </div>

        {/* Command Palette Footer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
          <span>Click an option</span>
          <span className="flex items-center gap-1">
            Ctrl K to close
          </span>
        </div>
      </div>
    </div>
  );
};
