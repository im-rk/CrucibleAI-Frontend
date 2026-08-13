import { useState } from 'react';
import { Shell } from './components/layout/Shell';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ResearchInput } from './components/research/ResearchInput';
import { PresetQueries } from './components/research/PresetQueries';
import { AgentProgress } from './components/research/AgentProgress';
import { HypothesisCard } from './components/research/HypothesisCard';
import { CandidatesTable } from './components/research/CandidatesTable';
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
import { Layers, Cpu, BookOpen, LayoutDashboard, BarChart3, Download, FileCode, Radar } from 'lucide-react';
import { clsx } from 'clsx';

type ResultTab = 'overview' | 'candidates' | 'predictions' | 'analytics' | 'radar' | 'literature';

export function App() {
  const { isOnline, health, corpus } = useHealth();
  const { mode, toggleMode } = useTheme();
  const {
    status,
    query,
    sseEvents,
    overallProgress,
    currentStepMessage,
    result,
    error,
    executeResearch,
    resetResearch,
  } = useResearch();

  const [activeTab, setActiveTab] = useState<ResultTab>('overview');
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const isLoading = status === 'SUBMITTING' || status === 'STREAMING';
  const hasResult = status === 'COMPLETED' && result !== null;

  const handleSelectQuery = (selectedQuery: string) => {
    executeResearch(selectedQuery);
  };

  const handleExportMarkdown = () => {
    if (result) exportResearchMarkdown(result);
  };

  const handleExportJSON = () => {
    if (result) exportResearchJSON(result);
  };

  return (
    <Shell>
      {/* Top Navbar */}
      <Header
        isOnline={isOnline}
        onOpenTools={() => setIsToolsOpen(true)}
        onNewResearch={resetResearch}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onExportMarkdown={handleExportMarkdown}
        hasActiveResearch={status !== 'IDLE'}
        hasResults={hasResult}
      />

      {/* Main Workspace Container */}
      <div className="space-y-6 pt-4">
        {/* Research Input Bar */}
        <ResearchInput
          onSubmit={(q, maxRes) => executeResearch(q, maxRes)}
          isLoading={isLoading}
          initialQuery={query}
        />

        {/* IDLE STATE */}
        {status === 'IDLE' && (
          <div className="space-y-6">
            <EmptyState corpus={corpus} />
            <PresetQueries onSelectQuery={handleSelectQuery} disabled={isLoading} />
          </div>
        )}

        {/* LOADING / STREAMING STATE */}
        {isLoading && (
          <div className="space-y-6">
            <AgentProgress
              progress={overallProgress}
              currentMessage={currentStepMessage}
              sseEvents={sseEvents}
              isCompleted={false}
            />
          </div>
        )}

        {/* ERROR STATE */}
        {status === 'ERROR' && error && (
          <ErrorState
            error={error}
            onRetry={() => query && executeResearch(query)}
          />
        )}

        {/* COMPLETED RESULTS STATE */}
        {hasResult && result && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Hypotheses Banner */}
            <HypothesisCard
              hypothesis={result.hypothesis}
              query={result.query}
              sessionId={result.session_id}
            />

            {/* Results Navigation Tabs & Quick Export Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Synthesis Overview', icon: LayoutDashboard },
                  { id: 'candidates', label: `Candidates (${result.candidate_formulas.length})`, icon: Layers },
                  { id: 'predictions', label: `ML KRR Bandgaps (${Object.keys(result.krr_predictions).length})`, icon: Cpu },
                  { id: 'analytics', label: 'Property Charts', icon: BarChart3 },
                  { id: 'radar', label: 'Scientific Radar', icon: Radar },
                  { id: 'literature', label: `Evidence (${result.search_results.length})`, icon: BookOpen },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        sounds.playClick();
                        setActiveTab(tab.id as ResultTab);
                      }}
                      className={clsx(
                        'px-4 py-2 text-xs font-mono rounded-lg transition-all flex items-center gap-2 border whitespace-nowrap',
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40 font-semibold shadow-md shadow-cyan-500/10'
                          : 'bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 1-Click Export Report Buttons */}
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

            {/* Tab Views */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <MaterialRadarChart
                  candidateFormulas={result.candidate_formulas}
                  propertyRecords={result.property_records}
                  krrPredictions={result.krr_predictions}
                />

                <MaterialComparisonChart
                  candidateFormulas={result.candidate_formulas}
                  propertyRecords={result.property_records}
                  krrPredictions={result.krr_predictions}
                />

                <CandidatesTable
                  candidateFormulas={result.candidate_formulas}
                  propertyRecords={result.property_records}
                  krrPredictions={result.krr_predictions}
                />

                <PredictionDisplay
                  predictions={result.krr_predictions}
                  propertyRecords={result.property_records}
                />

                <CitationsPanel
                  searchResults={result.search_results}
                  query={result.query}
                />

                {/* Collapsible Execution Log */}
                <AgentProgress
                  progress={100}
                  currentMessage="Workflow execution finished successfully."
                  agentLogs={result.agent_logs}
                  isCompleted={true}
                />
              </div>
            )}

            {activeTab === 'candidates' && (
              <CandidatesTable
                candidateFormulas={result.candidate_formulas}
                propertyRecords={result.property_records}
                krrPredictions={result.krr_predictions}
              />
            )}

            {activeTab === 'predictions' && (
              <PredictionDisplay
                predictions={result.krr_predictions}
                propertyRecords={result.property_records}
              />
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

            {activeTab === 'literature' && (
              <CitationsPanel
                searchResults={result.search_results}
                query={result.query}
              />
            )}
          </div>
        )}
      </div>

      {/* Direct Tools Drawer */}
      <DirectToolsDrawer
        isOpen={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
      />

      {/* Command Palette Overlay */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectQuery={handleSelectQuery}
        onOpenTools={() => setIsToolsOpen(true)}
        onToggleTheme={toggleMode}
        onExportMarkdown={handleExportMarkdown}
        onExportJSON={handleExportJSON}
        isDarkMode={mode === 'dark'}
        hasResults={hasResult}
      />

      {/* Footer */}
      <Footer health={health} />
    </Shell>
  );
}

export default App;
