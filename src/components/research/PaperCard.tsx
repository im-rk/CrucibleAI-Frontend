import React, { useState } from 'react';
import { SearchResultChunk } from '../../types/api';
import { formatSimilarity, formatArxivUrl } from '../../utils/formatters';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { sounds } from '../../utils/audio';

interface PaperCardProps {
  chunk: SearchResultChunk;
}

export const PaperCard: React.FC<PaperCardProps> = ({ chunk }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const meta = chunk.metadata;
  const arxivId = meta.arxiv_id || 'arXiv:2608.09924v1';
  const arxivUrl = formatArxivUrl(arxivId);
  const authorsStr = Array.isArray(meta.authors) ? meta.authors.join(', ') : meta.authors || 'Unknown Authors';

  const toggleExpand = () => {
    sounds.playClick();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800/80 hover:border-cyan-500/50 p-4 transition-all duration-200 flex flex-col justify-between space-y-3 shadow-sm">
      <div>
        {/* Top bar: ArXiv ID & Cosine Similarity Meter */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <a
            href={arxivUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded hover:bg-cyan-500/20 transition-colors"
          >
            {arxivId}
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Cosine similarity rating */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 dark:text-slate-300">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Similarity:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatSimilarity(chunk.similarity)}</span>
          </div>
        </div>

        {/* Paper Title */}
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 mb-1.5 leading-snug">
          {meta.title || 'Untitled Research Paper'}
        </h4>

        {/* Metadata info */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-mono mb-3">
          <span>{authorsStr}</span>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <span>{meta.year || 2026}</span>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <span className="text-cyan-700 dark:text-cyan-300 bg-slate-200 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-800 text-[11px]">
            {meta.section || 'General'}
          </span>
        </div>

        {/* Text snippet */}
        <div className="relative bg-white dark:bg-slate-900/90 rounded-xl p-3 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-800 dark:text-slate-300 font-sans leading-relaxed shadow-sm">
          <p className={clsx(!isExpanded && 'line-clamp-3')}>
            "{chunk.text}"
          </p>

          {chunk.text.length > 180 && (
            <button
              onClick={toggleExpand}
              className="mt-2 text-cyan-600 dark:text-cyan-400 hover:underline font-mono text-[11px] flex items-center gap-1"
            >
              {isExpanded ? (
                <>Show less <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>Read full chunk snippet <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
