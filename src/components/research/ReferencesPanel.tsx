import React from 'react';
import { Citation } from '../../types/api';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { BookMarked, ExternalLink } from 'lucide-react';

interface ReferencesPanelProps {
  citations: Citation[];
}

export const ReferencesPanel: React.FC<ReferencesPanelProps> = ({ citations }) => (
  <Card className="border-slate-200 dark:border-slate-800">
    <CardHeader>
      <CardTitle icon={<BookMarked className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}>References</CardTitle>
      <span className="text-xs font-mono text-slate-500">{citations.length} sources</span>
    </CardHeader>
    <CardContent>
      {citations.length === 0 ? (
        <p className="text-sm text-slate-500 font-sans">No sources were cited.</p>
      ) : (
        <ol className="space-y-3">
          {citations.map((c) => (
            <li key={c.id} className="flex gap-3 text-sm font-sans">
              <span className="font-mono text-xs text-cyan-700 dark:text-cyan-400 mt-0.5 shrink-0">[{c.id}]</span>
              <div className="min-w-0 space-y-1">
                <p className="text-slate-900 dark:text-slate-100 font-medium">
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noreferrer" className="hover:underline inline-flex items-center gap-1">
                      {c.title} <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    c.title
                  )}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {[c.authors, c.year, c.doi ? `DOI ${c.doi}` : c.source_id].filter(Boolean).join(' · ')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {c.cited_by_hypotheses.map((n) => (
                    <Badge key={`h${n}`} variant="cyan" size="sm">cited by H{n}</Badge>
                  ))}
                  {c.supports_candidates.map((f) => (
                    <Badge key={f} variant="emerald" size="sm">supports {f}</Badge>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </CardContent>
  </Card>
);
