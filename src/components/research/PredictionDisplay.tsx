import React from 'react';
import { KRRPrediction, MaterialProperty } from '../../types/api';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { getConfidenceBadgeColor } from '../../utils/formatters';
import { Cpu, AlertCircle, Sparkles } from 'lucide-react';

interface PredictionDisplayProps {
  predictions: Record<string, KRRPrediction>;
  propertyRecords: Record<string, MaterialProperty[]>;
}

export const PredictionDisplay: React.FC<PredictionDisplayProps> = ({
  predictions,
  propertyRecords,
}) => {
  const formulas = Object.keys(predictions);

  if (formulas.length === 0) return null;

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle icon={<Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}>
          Machine Learning Property Predictions (Kernel Ridge Regression)
        </CardTitle>
        <Badge variant="indigo" size="sm">
          RBF Kernel Engine Active
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formulas.map((formula) => {
            const pred = predictions[formula];
            const props = propertyRecords[formula] || [];
            const knownBgProp = props.find((p) => p.property_name.toLowerCase().includes('band'));
            const confidenceStyle = getConfidenceBadgeColor(pred.confidence);

            return (
              <div
                key={formula}
                className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/40 transition-all space-y-3 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-base text-cyan-700 dark:text-cyan-400">
                    {formula}
                  </span>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${confidenceStyle.bg} ${confidenceStyle.text} ${confidenceStyle.border}`}>
                    {pred.confidence || 'medium'} confidence
                  </span>
                </div>

                {/* Values comparison grid */}
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                  <div className="bg-white dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">KRR ML Predicted</span>
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {pred.predicted_value} <span className="text-xs">{pred.unit}</span>
                      {pred.uncertainty != null && (
                        <span className="text-xs font-normal text-slate-500"> ±{pred.uncertainty}</span>
                      )}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Reported (database / literature)</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
                      {knownBgProp ? `${knownBgProp.value}` : 'N/A'}{' '}
                      <span className="text-xs">{knownBgProp?.unit || 'eV'}</span>
                    </span>
                  </div>
                </div>

                {/* Method & Note */}
                <div className="space-y-1 pt-1 text-xs font-mono text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/60">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[11px]">{pred.method}</span>
                  </div>
                  {pred.note && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1 pt-1 font-sans">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{pred.note}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
