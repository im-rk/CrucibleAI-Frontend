import React, { useState } from 'react';
import { MaterialProperty, KRRPrediction } from '../../types/api';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { BarChart3 } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface MaterialComparisonChartProps {
  candidateFormulas: string[];
  propertyRecords: Record<string, MaterialProperty[]>;
  krrPredictions: Record<string, KRRPrediction>;
}

export const MaterialComparisonChart: React.FC<MaterialComparisonChartProps> = ({
  candidateFormulas,
  propertyRecords,
  krrPredictions,
}) => {
  const [metric, setMetric] = useState<'bandgap' | 'formation_energy' | 'density'>('bandgap');

  const maxValues: Record<string, number> = {
    bandgap: 1.0,
    formation_energy: 1.0,
    density: 1.0,
  };

  const formulaData = candidateFormulas.map((formula) => {
    const props = propertyRecords[formula] || [];
    const krr = krrPredictions[formula];

    const knownBgProp = props.find((p) => p.property_name.toLowerCase().includes('band'));
    const formEnergyProp = props.find((p) => p.property_name.toLowerCase().includes('formation'));
    const densityProp = props.find((p) => p.property_name.toLowerCase().includes('density'));

    const knownBg = knownBgProp ? Number(knownBgProp.value) || 0 : 0;
    const krrBg = krr ? krr.predicted_value || 0 : 0;
    const formEnergy = formEnergyProp ? Math.abs(Number(formEnergyProp.value) || 0) : 0;
    const density = densityProp ? Number(densityProp.value) || 0 : 0;

    if (knownBg > maxValues.bandgap) maxValues.bandgap = knownBg;
    if (krrBg > maxValues.bandgap) maxValues.bandgap = krrBg;
    if (formEnergy > maxValues.formation_energy) maxValues.formation_energy = formEnergy;
    if (density > maxValues.density) maxValues.density = density;

    return {
      formula,
      knownBg,
      krrBg,
      formEnergy,
      density,
      unit: metric === 'bandgap' ? 'eV' : metric === 'formation_energy' ? 'eV/atom' : 'g/cm³',
    };
  });

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle icon={<BarChart3 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}>
          Interactive Candidate Material Property Visualizer
        </CardTitle>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs">
          <button
            onClick={() => {
              sounds.playClick();
              setMetric('bandgap');
            }}
            className={`px-3 py-1 rounded transition-all ${
              metric === 'bandgap'
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Bandgap Comparison
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setMetric('formation_energy');
            }}
            className={`px-3 py-1 rounded transition-all ${
              metric === 'formation_energy'
                ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Formation Energy
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setMetric('density');
            }}
            className={`px-3 py-1 rounded transition-all ${
              metric === 'density'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Density
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Comparative Bars */}
        <div className="space-y-4 pt-2">
          {formulaData.map((item) => {
            let knownVal = 0;
            let predVal = 0;
            let maxVal = 1;

            if (metric === 'bandgap') {
              knownVal = item.knownBg;
              predVal = item.krrBg;
              maxVal = maxValues.bandgap || 1;
            } else if (metric === 'formation_energy') {
              knownVal = item.formEnergy;
              maxVal = maxValues.formation_energy || 1;
            } else {
              knownVal = item.density;
              maxVal = maxValues.density || 1;
            }

            const knownPercent = Math.min(100, Math.max(12, (knownVal / maxVal) * 100));
            const predPercent = Math.min(100, Math.max(12, (predVal / maxVal) * 100));

            return (
              <div key={item.formula} className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 shadow-sm">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-cyan-700 dark:text-cyan-400 text-sm">{item.formula}</span>
                  <div className="flex items-center gap-3">
                    {metric === 'bandgap' && (
                      <span className="text-indigo-700 dark:text-indigo-400">
                        KRR: <span className="font-bold">{item.krrBg} eV</span>
                      </span>
                    )}
                    <span className="text-slate-800 dark:text-slate-200">
                      MP: <span className="font-bold">{knownVal} {item.unit}</span>
                    </span>
                  </div>
                </div>

                {/* Meter Progress Bars */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 w-16">MP Known</span>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${knownPercent}%` }}
                      />
                    </div>
                  </div>

                  {metric === 'bandgap' && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 w-16">KRR Predict</span>
                      <div className="flex-1 bg-slate-200 dark:bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${predPercent}%` }}
                        />
                      </div>
                    </div>
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
