import React, { useState } from 'react';
import { SearchResultChunk } from '../../types/api';
import { PaperCard } from './PaperCard';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { BookOpen, Filter, Search, SlidersHorizontal } from 'lucide-react';

interface CitationsPanelProps {
  searchResults: SearchResultChunk[];
  query: string;
}

export const CitationsPanel: React.FC<CitationsPanelProps> = ({
  searchResults,
  query: _query,
}) => {
  const [minSimilarity, setMinSimilarity] = useState<number>(0);
  const [textSearch, setTextSearch] = useState<string>('');

  const filteredResults = searchResults.filter((chunk) => {
    const simPercent = Math.round((chunk.similarity || 0) * 100);
    const matchesSimilarity = simPercent >= minSimilarity;
    const matchesText =
      !textSearch.trim() ||
      chunk.text.toLowerCase().includes(textSearch.toLowerCase()) ||
      chunk.metadata.title.toLowerCase().includes(textSearch.toLowerCase()) ||
      (chunk.metadata.arxiv_id || '').toLowerCase().includes(textSearch.toLowerCase());

    return matchesSimilarity && matchesText;
  });

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle icon={<BookOpen className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}>
          Retrieved Literature Evidence & Paper Citations
        </CardTitle>
        <span className="text-xs font-mono text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/30">
          ChromaDB Vector Store ({filteredResults.length} of {searchResults.length} chunks)
        </span>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Interactive Filter Bar */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs font-mono shadow-sm">
          {/* Text Search Filter */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={textSearch}
              onChange={(e) => setTextSearch(e.target.value)}
              placeholder="Filter papers by title, author, or text snippet..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Similarity Threshold Slider */}
          <div className="flex items-center gap-2 font-mono text-slate-600 dark:text-slate-400 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Min Similarity:</span>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minSimilarity}
              onChange={(e) => setMinSimilarity(Number(e.target.value))}
              className="w-24 accent-cyan-500 cursor-pointer"
            />
            <span className="font-bold text-cyan-600 dark:text-cyan-400 w-10">{minSimilarity}%</span>
          </div>
        </div>

        {/* Paper Chunk Cards Grid */}
        {filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResults.map((chunk) => (
              <PaperCard key={chunk.id} chunk={chunk} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 font-mono text-xs space-y-2">
            <Filter className="w-6 h-6 text-slate-400 dark:text-slate-600 mx-auto" />
            <p>No literature paper chunks match your active filters.</p>
            <button
              onClick={() => {
                setMinSimilarity(0);
                setTextSearch('');
              }}
              className="text-cyan-600 dark:text-cyan-400 hover:underline text-xs"
            >
              Reset Citation Filters
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
