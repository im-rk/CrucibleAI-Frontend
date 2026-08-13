import React, { useState } from 'react';
import { MaterialProperty, KRRPrediction } from '../../types/api';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { ExternalLink, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface CandidatesTableProps {
  candidateFormulas: string[];
  propertyRecords: Record<string, MaterialProperty[]>;
  krrPredictions: Record<string, KRRPrediction>;
}

export const CandidatesTable: React.FC<CandidatesTableProps> = ({
  candidateFormulas,
  propertyRecords,
  krrPredictions,
}) => {
  const [expandedFormula, setExpandedFormula] = useState<string | null>(null);

  const toggleExpand = (formula: string) => {
    sounds.playClick();
    setExpandedFormula((prev) => (prev === formula ? null : formula));
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle icon={<Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}>
          Screened Material Candidates & Physical Properties
        </CardTitle>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          {candidateFormulas.length} Candidates Screened
        </span>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-800 dark:text-slate-300">
          <thead className="bg-slate-100 dark:bg-slate-950/80 text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Formula</th>
              <th className="py-3.5 px-4">MP Material ID</th>
              <th className="py-3.5 px-4">Known Bandgap</th>
              <th className="py-3.5 px-4">KRR Predicted BG</th>
              <th className="py-3.5 px-4">Formation Energy</th>
              <th className="py-3.5 px-4">Density</th>
              <th className="py-3.5 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-sans">
            {candidateFormulas.map((formula) => {
              const props = propertyRecords[formula] || [];
              const krr = krrPredictions[formula];

              const bgProp = props.find((p) => p.property_name.toLowerCase().includes('band'));
              const formEnergyProp = props.find((p) => p.property_name.toLowerCase().includes('formation'));
              const densityProp = props.find((p) => p.property_name.toLowerCase().includes('density'));
              const isExpanded = expandedFormula === formula;

              return (
                <React.Fragment key={formula}>
                  <tr
                    onClick={() => toggleExpand(formula)}
                    className="hover:bg-slate-100 dark:hover:bg-slate-850/50 cursor-pointer transition-colors"
                  >
                    {/* Formula */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {formula}
                        </span>
                      </div>
                    </td>

                    {/* MP Material ID */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {bgProp?.material_id || 'mp-lookup'}
                    </td>

                    {/* Known Bandgap */}
                    <td className="py-3.5 px-4 font-mono">
                      {bgProp ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 dark:text-slate-200">
                            {bgProp.value} {bgProp.unit}
                          </span>
                          {bgProp.is_direct_gap !== undefined && (
                            <Badge
                              variant={bgProp.is_direct_gap ? 'emerald' : 'slate'}
                              size="sm"
                            >
                              {bgProp.is_direct_gap ? 'Direct' : 'Indirect'}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">N/A</span>
                      )}
                    </td>

                    {/* KRR Predicted Bandgap */}
                    <td className="py-3.5 px-4 font-mono">
                      {krr ? (
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {krr.predicted_value} {krr.unit}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">Computing...</span>
                      )}
                    </td>

                    {/* Formation Energy */}
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {formEnergyProp ? `${formEnergyProp.value} ${formEnergyProp.unit}` : 'N/A'}
                    </td>

                    {/* Density */}
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {densityProp ? `${densityProp.value} ${densityProp.unit}` : 'N/A'}
                    </td>

                    {/* Action toggle */}
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-slate-400 hover:text-cyan-500 p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Property Detail Row */}
                  {isExpanded && (
                    <tr className="bg-slate-50 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800">
                      <td colSpan={7} className="p-4">
                        <div className="bg-white dark:bg-slate-900/90 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs shadow-sm">
                          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                            <span className="text-cyan-700 dark:text-cyan-400 font-bold">
                              Full Property Catalog for {formula}
                            </span>
                            {bgProp?.doi && (
                              <a
                                href={bgProp.doi}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                              >
                                DOI Source Reference <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                              <span className="text-slate-500 uppercase text-[10px]">Materials Project Source</span>
                              <p className="text-slate-900 dark:text-slate-200 font-semibold">{bgProp?.source || 'Materials Project API'}</p>
                              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Material ID: {bgProp?.material_id || 'N/A'}</p>
                            </div>

                            <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                              <span className="text-slate-500 uppercase text-[10px]">KRR Predictor Method</span>
                              <p className="text-indigo-700 dark:text-indigo-300 font-semibold">{krr?.method || 'Kernel Ridge Regression'}</p>
                              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Confidence: {krr?.confidence || 'medium'}</p>
                            </div>

                            <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                              <span className="text-slate-500 uppercase text-[10px]">Validation Note</span>
                              <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-normal">{krr?.note || 'Machine learning model prediction.'}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
