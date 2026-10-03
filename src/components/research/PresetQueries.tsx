import React from 'react';
import { PRESET_QUERIES } from '../../utils/constants';

interface PresetQueriesProps {
  onSelectQuery: (query: string) => void;
  disabled?: boolean;
}

export const PresetQueries: React.FC<PresetQueriesProps> = ({ onSelectQuery, disabled = false }) => (
  <section>
    <h2 className="text-lg font-semibold mb-2">Examples</h2>
    <ul className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
      {PRESET_QUERIES.map((preset) => (
        <li key={preset.query}>
          <button
            disabled={disabled}
            onClick={() => onSelectQuery(preset.query)}
            className="w-full text-left py-3 px-1 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-50"
          >
            <span className="font-medium text-slate-900 dark:text-slate-100">{preset.title}</span>
            <span className="ml-2 text-xs uppercase tracking-wide text-slate-500">{preset.category}</span>
            <span className="block text-sm text-slate-600 dark:text-slate-400">{preset.description}</span>
          </button>
        </li>
      ))}
    </ul>
  </section>
);
