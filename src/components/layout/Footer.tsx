import React from 'react';
import { HealthResponse } from '../../types/api';

export const Footer: React.FC<{ health?: HealthResponse | null }> = ({ health }) => (
  <footer className="border-t border-slate-200 dark:border-slate-800 py-5">
    <div className="flex flex-wrap justify-between gap-2 text-sm text-slate-500 dark:text-slate-400">
      <span>CrucibleAI</span>
      <span>
        {health?.vector_store_chunks != null ? `${health.vector_store_chunks} passages indexed` : 'Corpus size unknown'}
        {' · '}
        Band gaps from Materials Project are DFT values and usually read low.
      </span>
    </div>
  </footer>
);
