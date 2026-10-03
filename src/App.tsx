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

  const tabs: { id: ResultTab; label: string }[] = result
    ? [
        { id: 'overview', label: 'Overview' },
        { id: 'candidates', label: `Candidates (${result.candidates.length})` },
        { id: 'hypotheses', label: `Hypotheses (${result.hypotheses.length})` },
        { id: 'predictions', label: `Predictions (${Object.keys(result.krr_predictions).length})` },
        { id: 'analytics', label: 'Charts' },
        { id: 'radar', label: 'Radar' },
        { id: 'literature', label: `Evidence (${result.search_results.length})` },
        { id: 'references', label: `References (${result.citations.length})` },
      ]
    : [];

  return (
    <Shell>
      <Header
        isOnline={isOnline}
        onOpenTools={() => setIsToolsOpen(true)}
        onNewResearch={resetResearch}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        hasActiveResearch={status !== 'IDLE'}
      />

      <div className="space-y-8">
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
          <div className="space-y-6">
            <RunModeBanner mode={result.mode} warnings={result.warnings} />
            <HypothesisCard hypothesis={result.hypothesis} query={result.query} sessionId={result.session_id} />

            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex gap-1 overflow-x-auto" role="tablist">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(tab.id)}
                      className={clsx(
                        'px-3 py-2 text-sm whitespace-nowrap border-b-2 -mb-px',
                        isActive
                          ? 'border-cyan-700 text-slate-900 dark:text-slate-100 dark:border-cyan-400 font-medium'
                          : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 pb-2 text-sm">
                <span className="text-slate-500">Export</span>
                <button onClick={handleExportMarkdown} className="underline underline-offset-4 hover:text-cyan-700 dark:hover:text-cyan-400">
                  Markdown
                </button>
                <button onClick={handleExportJSON} className="underline underline-offset-4 hover:text-cyan-700 dark:hover:text-cyan-400">
                  JSON
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
        onOpen={() => setIsCommandPaletteOpen(true)}
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
