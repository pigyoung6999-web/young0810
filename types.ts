
export enum AppState {
  SCENARIO_SELECTION,
  SIMULATION_IN_PROGRESS,
  DECISION_ANALYSIS,
}

export interface Scenario {
  id: string;
  category: '위기' | '기회' | '조직' | '환경';
  title: string;
  description: string;
}

export interface ConversationTurn {
  speaker: 'leader' | 'ai';
  text: string;
}

export interface AnalysisResult {
  riskAppetite: '낮음' | '중간' | '높음' | '정보 부족';
  expectedOutcome: string;
  additionalSuggestions: string[];
}
