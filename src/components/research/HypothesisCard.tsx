import React, { useState } from 'react';

interface HypothesisCardProps {
  hypothesis: string;
  query: string;
  sessionId: string;
}

export const HypothesisCard: React.FC<HypothesisCardProps> = ({ hypothesis, query, sessionId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hypothesis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="border-l-4 border-cyan-700 dark:border-cyan-400 pl-5 py-1">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-sans font-medium">
          Leading hypothesis
        </h2>
        <button onClick={handleCopy} className="text-sm underline underline-offset-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="mt-1 text-xl font-serif leading-snug text-slate-900 dark:text-slate-100">{hypothesis}</p>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        Goal: {query}
        <span className="mx-2 text-slate-300 dark:text-slate-700">|</span>
        Run <span className="font-mono text-xs">{sessionId}</span>
      </p>
    </section>
  );
};
