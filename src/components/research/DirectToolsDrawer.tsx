import React, { useEffect, useState } from 'react';
import { X, Search, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { KRRPrediction, MaterialProperty } from '../../types/api';

interface DirectToolsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DirectToolsDrawer: React.FC<DirectToolsDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'predict' | 'lookup'>('predict');

  // KRR Predict state
  const [predictFormula, setPredictFormula] = useState('GaN');
  const [propertyName, setPropertyName] = useState('band_gap');
  const [predictResult, setPredictResult] = useState<KRRPrediction | null>(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);

  // Materials Lookup state
  const [lookupFormula, setLookupFormula] = useState('GaN');
  const [lookupProperties, setLookupProperties] = useState<MaterialProperty[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);


  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!predictFormula.trim()) return;
    setPredictLoading(true);
    setPredictError(null);
    setPredictResult(null);

    try {
      const res = await api.predictProperty(predictFormula.trim(), propertyName);
      setPredictResult(res);
    } catch (err) {
      setPredictError(err instanceof Error ? err.message : 'KRR prediction failed');
    } finally {
      setPredictLoading(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupFormula.trim()) return;
    setLookupLoading(true);
    setLookupError(null);
    setLookupProperties([]);

    try {
      const res = await api.lookupMaterial(lookupFormula.trim());
      setLookupProperties(res.properties || []);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Materials lookup failed');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Lookup and predict" className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 dark:bg-slate-950/80 flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col text-slate-900 dark:text-slate-100">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center gap-2">
            
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans">
              Lookup & predict
            </h3>
          </div>
          <button
            onClick={() => {
              onClose();
            }}
            className="text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/40 p-2 gap-1.5 text-xs">
          <button
            onClick={() => {
              setActiveTab('predict');
            }}
            className={`flex-1 py-2 rounded-lg border transition-all flex items-center justify-center gap-1 ${
              activeTab === 'predict'
                ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/40 font-semibold'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            
            Predict
          </button>
          <button
            onClick={() => {
              setActiveTab('lookup');
            }}
            className={`flex-1 py-2 rounded-lg border transition-all flex items-center justify-center gap-1 ${
              activeTab === 'lookup'
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40 font-semibold'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            
            Database
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'predict' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Estimate a property from the chemical formula alone (kernel ridge regression). It is an estimate with an uncertainty, not a measurement.
              </p>

              <form onSubmit={handlePredict} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-700 dark:text-slate-300 mb-1">
                    Chemical Formula
                  </label>
                  <input
                    type="text"
                    value={predictFormula}
                    onChange={(e) => setPredictFormula(e.target.value)}
                    placeholder="e.g. GaN, Li7La3Zr2O12, CsPbI3"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-700 dark:text-slate-300 mb-1">
                    Target Property
                  </label>
                  <select
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="band_gap">band_gap (Bandgap eV)</option>
                    <option value="formation_energy_per_atom">formation_energy (eV/atom)</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={predictLoading}
                  
                >
                  Predict
                </Button>
              </form>

              {predictError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{predictError}</span>
                </div>
              )}

              {predictResult && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-md border border-indigo-500/30 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-cyan-700 dark:text-cyan-400 font-bold">{predictResult.formula}</span>
                    <span className="text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                      {predictResult.predicted_value} {predictResult.unit}
                    </span>
                  </div>
                  <div className="space-y-1 text-slate-600 dark:text-slate-400">
                    <p><span className="text-slate-500 dark:text-slate-500">Method:</span> {predictResult.method}</p>
                    <p><span className="text-slate-500 dark:text-slate-500">Confidence:</span> {predictResult.confidence}</p>
                    <p className="text-[11px] text-slate-500 pt-1 font-sans">{predictResult.note}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'lookup' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Directly query Materials Project REST API for physical property records.
              </p>

              <form onSubmit={handleLookup} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-700 dark:text-slate-300 mb-1">
                    Chemical Formula
                  </label>
                  <input
                    type="text"
                    value={lookupFormula}
                    onChange={(e) => setLookupFormula(e.target.value)}
                    placeholder="e.g. GaN, Li7La3Zr2O12"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full"
                  isLoading={lookupLoading}
                  icon={<Search className="w-4 h-4" />}
                >
                  Lookup Materials Project
                </Button>
              </form>

              {lookupError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{lookupError}</span>
                </div>
              )}

              {lookupProperties.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-cyan-700 dark:text-cyan-400 font-semibold">
                    Found {lookupProperties.length} property records:
                  </span>
                  {lookupProperties.map((prop, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-900 dark:text-slate-200 font-semibold">
                        <span>{prop.property_name}</span>
                        <span className="text-cyan-700 dark:text-cyan-400">{prop.value} {prop.unit}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>ID: {prop.material_id}</span>
                        <span>Source: {prop.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
