import React, { useState, useCallback } from 'react';
import { AppState, Scenario, ConversationTurn, AnalysisResult } from './types';
import ScenarioSelection from './components/ScenarioSelection';
import Simulation from './components/Simulation';
import DecisionAnalysis from './components/DecisionAnalysis';
import { getDecisionAnalysis } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SCENARIO_SELECTION);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [decisionSpeed, setDecisionSpeed] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleStartSimulation = useCallback((scenario: Scenario) => {
    setSelectedScenario(scenario);
    setConversation([]);
    setAnalysis(null);
    setDecisionSpeed('');
    setStartTime(Date.now());
    setAppState(AppState.SIMULATION_IN_PROGRESS);
  }, []);

  const handleMakeDecision = useCallback(async (finalConversation: ConversationTurn[]) => {
    setIsLoading(true);
    const endTime = Date.now();
    const durationInSeconds = Math.round((endTime - startTime) / 1000);
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    setDecisionSpeed(`${minutes}분 ${seconds}초`);
    setConversation(finalConversation);

    try {
      if (selectedScenario) {
        const result = await getDecisionAnalysis(selectedScenario, finalConversation);
        setAnalysis(result);
      }
    } catch (error) {
      console.error("Error getting decision analysis:", error);
      // Set a fallback analysis object on error
      setAnalysis({
        riskAppetite: '정보 부족',
        expectedOutcome: 'AI 분석 중 오류가 발생했습니다. 네트워크 연결을 확인하거나 나중에 다시 시도해 주세요.',
        additionalSuggestions: ['새로고침 후 다시 시작해 보세요.'],
      });
    } finally {
      setIsLoading(false);
      setAppState(AppState.DECISION_ANALYSIS);
    }
  }, [startTime, selectedScenario]);

  const handleRestart = useCallback(() => {
    setAppState(AppState.SCENARIO_SELECTION);
    setSelectedScenario(null);
    setConversation([]);
    setAnalysis(null);
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.SIMULATION_IN_PROGRESS:
        return selectedScenario ? (
          <Simulation
            scenario={selectedScenario}
            onMakeDecision={handleMakeDecision}
          />
        ) : null;
      case AppState.DECISION_ANALYSIS:
        return (
          <DecisionAnalysis
            analysis={analysis}
            decisionSpeed={decisionSpeed}
            onRestart={handleRestart}
            isLoading={isLoading}
          />
        );
      case AppState.SCENARIO_SELECTION:
      default:
        return <ScenarioSelection onStart={handleStartSimulation} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-ghost-white tracking-wider mb-2">
            <span className="text-brand-red font-black">LG</span> Chem | Agile Decision Simulator
          </h1>
          <p className="text-brand-gray text-lg">Powered by Google Gemini</p>
        </header>
        <main className="bg-gray-900/40 backdrop-blur-2xl border border-gray-500/30 rounded-3xl shadow-2xl p-6 sm:p-10 min-h-[650px] transition-all duration-500 ease-in-out">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;