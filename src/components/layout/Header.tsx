import React, { useState } from 'react';
import { Cpu, Wrench, RefreshCw, Sun, Moon, Command, Download, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useTheme } from '../../context/ThemeContext';
import { sounds } from '../../utils/audio';

interface HeaderProps {
  isOnline: boolean;
  onOpenTools: () => void;
  onNewResearch: () => void;
  onOpenCommandPalette: () => void;
  onExportMarkdown?: () => void;
  hasActiveResearch: boolean;
  hasResults: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  onOpenTools,
  onNewResearch,
  onOpenCommandPalette,
  onExportMarkdown,
  hasActiveResearch,
  hasResults,
}) => {
  const { mode, toggleMode } = useTheme();
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const handleToggleAudio = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleThemeClick = () => {
    sounds.playThemeSwitch();
    toggleMode();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/30 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
            <Cpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight font-sans">
                Crucible<span className="text-cyan-600 dark:text-cyan-400">AI</span>
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-bold flex items-center gap-1 shadow-sm">
                <Sparkles className="w-2.5 h-2.5 animate-spin" />
                1000/10 LEGENDARY
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Autonomous Materials Science Research Workstation
            </p>
          </div>
        </div>

        {/* Action Controls & Theme System */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backend Status */}
          <div className="hidden sm:flex items-center gap-2">
            <Badge
              variant={isOnline ? 'emerald' : 'rose'}
              size="sm"
              icon={
                <span className="relative flex h-2 w-2">
                  {isOnline && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isOnline ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  ></span>
                </span>
              }
            >
              {isOnline ? 'Backend Online' : 'Backend Disconnected'}
            </Badge>
          </div>

          {/* Command Palette Trigger Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenCommandPalette();
            }}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-cyan-500 text-slate-700 dark:text-slate-300 font-mono text-xs transition-all shadow-sm"
            title="Open Command Palette (Cmd+K)"
          >
            <Command className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Cmd+K</span>
          </button>

          {/* Audio Synthesizer Mute Toggle */}
          <button
            onClick={handleToggleAudio}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors shadow-sm"
            title={isMuted ? 'Unmute Audio FX' : 'Mute Audio FX'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-cyan-500" />}
          </button>

          {/* Theme Mode Toggle (Dark/Light) */}
          <button
            onClick={handleThemeClick}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all shadow-sm"
            title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {mode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Export Report Action if Results Exist */}
          {hasResults && onExportMarkdown && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sounds.playClick();
                onExportMarkdown();
              }}
              icon={<Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              className="hidden sm:inline-flex border-emerald-500/30 hover:border-emerald-500/50 text-emerald-700 dark:text-emerald-300"
            >
              Export Report
            </Button>
          )}

          {/* Direct Tools Drawer Trigger */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              sounds.playClick();
              onOpenTools();
            }}
            icon={<Wrench className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
          >
            <span className="hidden sm:inline">Direct Tools</span>
          </Button>

          {/* Reset / New Research Action */}
          {hasActiveResearch && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sounds.playClick();
                onNewResearch();
              }}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              New Goal
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
