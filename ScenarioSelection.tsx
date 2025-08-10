import React, { useState } from 'react';
import type { Scenario } from '../types';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface ScenarioSelectionProps {
  onStart: (scenario: Scenario) => void;
}

const scenarios: Scenario[] = [
  { id: 'crisis_1', category: '위기', title: '원재료 가격 30% 급등', description: '글로벌 원재료 공급망 혼란으로 인해, 핵심 원재료 가격이 30% 상승했습니다. 당장 조치하지 않으면 2분기 마진이 20% 하락할 것으로 예상됩니다.' },
  { id: 'opportunity_1', category: '기회', title: '경쟁사 기술 특허 만료', description: '주요 경쟁사의 핵심 기술 특허가 만료되었습니다. 이를 활용하여 시장 점유율을 확대할 수 있는 절호의 기회입니다.' },
  { id: 'org_1', category: '조직', title: '핵심 인재 이탈', description: '차세대 성장 동력으로 점찍은 신사업팀의 핵심 인재 3명이 경쟁사로 이직했습니다. 프로젝트 지연 및 팀 사기 저하가 우려되는 상황입니다.' },
  { id: 'env_1', category: '환경', title: '글로벌 탄소 규제 강화', description: '주요 수출국의 탄소 국경세 도입이 확정되었습니다. 이에 따라 생산 공정의 탄소 배출량 감축이 시급한 과제로 떠올랐습니다.' },
];

const ScenarioCard: React.FC<{ scenario: Scenario; isSelected: boolean; onSelect: () => void; }> = ({ scenario, isSelected, onSelect }) => {
  const categoryColor = {
    '위기': 'text-red-400 border-red-500',
    '기회': 'text-green-400 border-green-500',
    '조직': 'text-yellow-400 border-yellow-500',
    '환경': 'text-blue-400 border-blue-500',
  };

  return (
    <div
      onClick={onSelect}
      className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${isSelected ? `bg-brand-blue/30 scale-105 shadow-lg ${categoryColor[scenario.category]}` : `bg-slate-800/50 border-transparent hover:border-brand-gray/50 hover:bg-slate-800/70`}`}
    >
      <div className={`font-bold text-sm mb-2 ${isSelected ? categoryColor[scenario.category] : 'text-brand-gray'}`}>
        [{scenario.category}]
      </div>
      <h3 className="font-semibold text-ghost-white text-lg">{scenario.title}</h3>
    </div>
  );
};


const ScenarioSelection: React.FC<ScenarioSelectionProps> = ({ onStart }) => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(scenarios[0]);

  const handleStartClick = () => {
    if (selectedScenario) {
      onStart(selectedScenario);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in justify-between">
      <div>
        <h2 className="text-2xl font-bold text-center mb-2 text-ghost-white">시나리오 선택</h2>
        <p className="text-center text-brand-gray mb-10">훈련할 의사결정 시나리오를 선택하세요.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              isSelected={selectedScenario?.id === scenario.id}
              onSelect={() => setSelectedScenario(scenario)}
            />
          ))}
        </div>
      </div>
      <div className="mt-10 text-center">
        <button
          onClick={handleStartClick}
          disabled={!selectedScenario}
          className="w-full md:w-auto inline-flex items-center justify-center px-16 py-4 bg-brand-blue text-white font-bold text-lg rounded-xl shadow-lg hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
        >
          시뮬레이션 시작
          <ArrowRightIcon className="ml-3 w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ScenarioSelection;