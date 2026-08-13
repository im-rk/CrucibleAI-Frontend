import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Sparkles, Quote, Copy, Check } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface HypothesisCardProps {
  hypothesis: string;
  query: string;
  sessionId: string;
}

export const HypothesisCard: React.FC<HypothesisCardProps> = ({
  hypothesis,
  query,
  sessionId,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    sounds.playClick();
    navigator.clipboard.writeText(hypothesis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card glow className="bg-gradient-to-br from-white via-cyan-50/50 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-cyan-950/30 border-cyan-500/40">
      <CardHeader className="border-cyan-500/20">
        <CardTitle icon={<Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}>
          Synthesized Scientific Hypothesis & Finding
        </CardTitle>
        <button
          onClick={handleCopy}
          className="text-xs text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 flex items-center gap-1 font-mono transition-colors"
          title="Copy hypothesis text"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative pl-6 border-l-3 border-cyan-500 py-1">
          <Quote className="w-5 h-5 text-cyan-500/30 absolute -left-3 -top-2 bg-white dark:bg-slate-900 rounded-full" />
          <p className="text-base sm:text-lg text-slate-900 dark:text-slate-100 font-sans leading-relaxed font-medium">
            "{hypothesis}"
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs font-mono text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Research Target:</span>
            <span className="text-cyan-700 dark:text-cyan-300 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              {query}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Session ID:</span>
            <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px] truncate max-w-[200px]">
              {sessionId}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
