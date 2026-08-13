import React, { useEffect, useRef, useState } from 'react';
import { MaterialProperty, KRRPrediction } from '../../types/api';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Radar, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface MaterialRadarChartProps {
  candidateFormulas: string[];
  propertyRecords: Record<string, MaterialProperty[]>;
  krrPredictions: Record<string, KRRPrediction>;
}

export const MaterialRadarChart: React.FC<MaterialRadarChartProps> = ({
  candidateFormulas,
  propertyRecords,
  krrPredictions,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { mode } = useTheme();
  const [selectedFormula, setSelectedFormula] = useState<string>(candidateFormulas[0] || '');

  const isDark = mode === 'dark';

  useEffect(() => {
    if (!candidateFormulas.includes(selectedFormula)) {
      setSelectedFormula(candidateFormulas[0] || '');
    }
  }, [candidateFormulas, selectedFormula]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = 400);
    const height = (canvas.height = 300);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 100;

    const axes = [
      'Bandgap (eV)',
      'Direct Gap',
      'Formation Energy',
      'Density (g/cm³)',
      'KRR Predict (eV)',
    ];
    const totalAxes = axes.length;

    ctx.clearRect(0, 0, width, height);

    // Draw spiderweb concentric polygons
    const levels = 4;
    for (let level = 1; level <= levels; level++) {
      const r = (radius / levels) * level;
      ctx.beginPath();
      for (let i = 0; i < totalAxes; i++) {
        const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(203, 213, 225, 0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axis lines and labels
    for (let i = 0; i < totalAxes; i++) {
      const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(148, 163, 184, 0.6)';
      ctx.stroke();

      // Axis label text
      const lx = centerX + (radius + 24) * Math.cos(angle);
      const ly = centerY + (radius + 16) * Math.sin(angle);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(axes[i], lx, ly);
    }

    // Render candidate radar dataset if formula selected
    if (selectedFormula) {
      const props = propertyRecords[selectedFormula] || [];
      const krr = krrPredictions[selectedFormula];

      const bgProp = props.find((p) => p.property_name.toLowerCase().includes('band'));
      const formProp = props.find((p) => p.property_name.toLowerCase().includes('formation'));
      const densityProp = props.find((p) => p.property_name.toLowerCase().includes('density'));

      const bgVal = bgProp ? Math.min(1.0, (Number(bgProp.value) || 0) / 8.0) : 0.4;
      const directVal = bgProp?.is_direct_gap ? 0.9 : 0.4;
      const formVal = formProp ? Math.min(1.0, Math.abs(Number(formProp.value) || 0) / 4.0) : 0.5;
      const densityVal = densityProp ? Math.min(1.0, (Number(densityProp.value) || 0) / 10.0) : 0.5;
      const krrVal = krr ? Math.min(1.0, (krr.predicted_value || 0) / 8.0) : 0.5;

      const normalized = [bgVal, directVal, formVal, densityVal, krrVal];

      // Draw Radar Polygon
      ctx.beginPath();
      const points: Array<{ x: number; y: number }> = [];
      for (let i = 0; i < totalAxes; i++) {
        const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
        const r = radius * Math.max(0.15, normalized[i]);
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        points.push({ x, y });
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Fill with gradient glow
      const grad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius);
      grad.addColorStop(0, isDark ? 'rgba(6, 182, 212, 0.4)' : 'rgba(14, 116, 144, 0.3)');
      grad.addColorStop(1, isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(79, 70, 229, 0.1)');
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = isDark ? '#06b6d4' : '#0284c7';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw vertex glow points
      points.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#38bdf8' : '#0369a1';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }
  }, [candidateFormulas, selectedFormula, propertyRecords, krrPredictions, isDark]);

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle icon={<Radar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}>
          Multi-Axis Scientific Radar Profile
        </CardTitle>

        {/* Candidate Selector Pills */}
        <div className="flex items-center gap-1.5 font-mono text-xs overflow-x-auto">
          {candidateFormulas.map((formula) => (
            <button
              key={formula}
              onClick={() => setSelectedFormula(formula)}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                selectedFormula === formula
                  ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/40 font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {formula}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center p-4">
        <canvas ref={canvasRef} className="max-w-full h-auto" />
        <p className="mt-2 text-xs font-mono text-slate-500 dark:text-slate-400 text-center flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          Radar metric profile for <span className="font-bold text-cyan-600 dark:text-cyan-300">{selectedFormula}</span> across 5 scientific descriptors.
        </p>
      </CardContent>
    </Card>
  );
};
