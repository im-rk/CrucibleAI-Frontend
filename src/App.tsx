import { useState } from 'react';
import { Shell } from './components/layout/Shell';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ResearchInput } from './components/research/ResearchInput';
import { PresetQueries } from './components/research/PresetQueries';
import { AgentProgress } from './components/research/AgentProgress';
import { HypothesisCard } from './components/research/HypothesisCard';
import { HypothesesPanel } from './components/research/HypothesesPanel';
import { CandidatesTable } from './components/research/CandidatesTable';
import { KnowledgeGapsPanel } from './components/research/KnowledgeGapsPanel';
import { ReferencesPanel } from './components/research/ReferencesPanel';
import { RunModeBanner } from './components/research/RunModeBanner';
import { PredictionDisplay } from './components/research/PredictionDisplay';
import { CitationsPanel } from './components/research/CitationsPanel';
import { DirectToolsDrawer } from './components/research/DirectToolsDrawer';
import { MaterialComparisonChart } from './components/research/MaterialComparisonChart';
import { MaterialRadarChart } from './components/research/MaterialRadarChart';
import { CommandPalette } from './components/common/CommandPalette';
import { EmptyState } from './components/feedback/EmptyState';
import { ErrorState } from './components/feedback/ErrorState';
import { useResearch } from './hooks/useResearch';
import { useHealth } from './hooks/useHealth';
import { useTheme } from './context/ThemeContext';
import { exportResearchMarkdown, exportResearchJSON } from './utils/exportReport';
import { sounds } from './utils/audio';
import { Layers, Cpu, BookOpen, LayoutDashboard, BarChart3, Download, FileCode, Radar, FlaskConical, BookMarked } from 'lucide-react';
import { clsx } from 'clsx';

type ResultTab =
  | 'overview' | 'candidates' | 'hypotheses' | 'predictions' | 'analytics' | 'radar' | 'literature' | 'references';

export function App() {
  const { isOnline, health, corpus } = useHealth();
  const { mode, toggleMode } = useTheme();
  const { status, query, progress, result, error, executeResearch, resetResearch, cancelResearch } = useResearch();

  const [activeTab, setActiveTab] = useState<ResultTab>('overview');
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const isLoading = status === 'SUBMITTING' || status === 'STREAMING';
  const hasResult = status === 'COMPLETED' && result !== null;

  const handleExportMarkdown = () => {
    if (result) exportResearchMarkdown(result);
  };
  const handleExportJSON = () => {
    if (result) exportResearchJSON(result);
  };

  const tabs: { id: ResultTab; label: string; icon: React.ElementType }[] = result
    ? [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'candidates', label: `Candidates (${result.candidates.length})`, icon: Layers },
        { id: 'hypotheses', label: `Hypotheses (${result.hypotheses.length})`, icon: FlaskConical },
        { id: 'predictions', label: `ML Predictions (${Object.keys(result.krr_predictions).length})`, icon: Cpu },
        { id: 'analytics', label: 'Property Charts', icon: BarChart3 },
        { id: 'radar', label: 'Radar', icon: Radar },
        { id: 'literature', label: `Evidence (${result.search_results.length})`, icon: BookOpen },
        { id: 'references', label: `References (${result.citations.length})`, icon: BookMarked },
      ]
    : [];

  return (
    <Shell>
      <Header
        isOnline={isOnline}
        onOpenTools={() => setIsToolsOpen(true)}
        onNewResearch={resetResearch}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onExportMarkdown={handleExportMarkdown}
        hasActiveResearch={status !== 'IDLE'}
        hasResults={hasResult}
      />

      <div className="space-y-6 pt-4">
        <ResearchInput onSubmit={(q, maxRes) => executeResearch(q, maxRes)} isLoading={isLoading} initialQuery={query} />

        {status === 'IDLE' && (
          <div className="space-y-6">
            <EmptyState corpus={corpus} health={health} />
            <PresetQueries onSelectQuery={(q) => executeResearch(q)} disabled={isLoading} />
          </div>
        )}

        {isLoading && <AgentProgress progress={progress} onCancel={cancelResearch} />}

        {status === 'ERROR' && error && <ErrorState error={error} onRetry={() => query && executeResearch(query)} />}

        {hasResult && result && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <RunModeBanner mode={result.mode} warnings={result.warnings} />
            <HypothesisCard hypothesis={result.hypothesis} query={result.query} sessionId={result.session_id} />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 overflow-x-auto" role="tablist">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        sounds.playClick();
                        setActiveTab(tab.id);
                      }}
                      className={clsx(
                        'px-4 py-2 text-xs font-mono rounded-lg transition-all flex items-center gap-2 border whitespace-nowrap',
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40 font-semibold shadow-md shadow-cyan-500/10'
                          : 'bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200',
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                <button
                  onClick={() => {
                    sounds.playClick();
                    handleExportMarkdown();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 transition-colors"
                  title="Export Markdown Report (.md)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Report .md</span>
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    handleExportJSON();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                  title="Export JSON Dataset (.json)"
                >
                  <FileCode className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>JSON</span>
                </button>
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <HypothesesPanel hypotheses={result.hypotheses} grounding={result.grounding} />
                <CandidatesTable
                  candidates={result.candidates}
                  propertyRecords={result.property_records}
                  krrPredictions={result.krr_predictions}
                />
                <KnowledgeGapsPanel
                  gaps={result.knowledge_gaps}
                  criteria={result.criteria}
                  queries={result.search_queries}
                  retrievalAttempts={result.retrieval_attempts}
                />
                <AgentProgress agentLogs={result.agent_logs} isCompleted />
              </div>
            )}

            {activeTab === 'candidates' && (
              <CandidatesTable
                candidates={result.candidates}
                propertyRecords={result.property_records}
                krrPredictions={result.krr_predictions}
              />
            )}
            {activeTab === 'hypotheses' && (
              <div className="space-y-6">
                <HypothesesPanel hypotheses={result.hypotheses} grounding={result.grounding} />
                <KnowledgeGapsPanel
                  gaps={result.knowledge_gaps}
                  criteria={result.criteria}
                  queries={result.search_queries}
                  retrievalAttempts={result.retrieval_attempts}
                />
              </div>
            )}
            {activeTab === 'predictions' && (
              <PredictionDisplay predictions={result.krr_predictions} propertyRecords={result.property_records} />
            )}
            {activeTab === 'analytics' && (
              <MaterialComparisonChart
                candidateFormulas={result.candidate_formulas}
                propertyRecords={result.property_records}
                krrPredictions={result.krr_predictions}
              />
            )}
            {activeTab === 'radar' && (
              <MaterialRadarChart
                candidateFormulas={result.candidate_formulas}
                propertyRecords={result.property_records}
                krrPredictions={result.krr_predictions}
              />
            )}
            {activeTab === 'literature' && <CitationsPanel searchResults={result.search_results} query={result.query} />}
            {activeTab === 'references' && <ReferencesPanel citations={result.citations} />}
          </div>
        )}
      </div>

      <DirectToolsDrawer isOpen={isToolsOpen} onClose={() => setIsToolsOpen(false)} />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectQuery={(q) => executeResearch(q)}
        onOpenTools={() => setIsToolsOpen(true)}
        onToggleTheme={toggleMode}
        onExportMarkdown={handleExportMarkdown}
        onExportJSON={handleExportJSON}
        isDarkMode={mode === 'dark'}
        hasResults={hasResult}
      />

      <Footer health={health} />
    </Shell>
  );
}

export default App;
