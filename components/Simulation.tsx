import React, { useState, useRef, useEffect } from 'react';
import type { Scenario, ConversationTurn } from '../types';
import { getAiResponse } from '../services/geminiService';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface SimulationProps {
  scenario: Scenario;
  onMakeDecision: (conversation: ConversationTurn[]) => void;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-brand-gray rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-brand-gray rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-brand-gray rounded-full animate-pulse"></div>
        <span className="text-sm text-brand-gray">AI가 응답을 생성 중입니다...</span>
    </div>
);


const Simulation: React.FC<SimulationProps> = ({ scenario, onMakeDecision }) => {
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);
  
  const handleSend = async () => {
    if (!userInput.trim() || isLoading) return;

    const newConversation: ConversationTurn[] = [...conversation, { speaker: 'leader', text: userInput }];
    setConversation(newConversation);
    setUserInput('');
    setIsLoading(true);

    try {
      const aiText = await getAiResponse(scenario, newConversation, userInput);
      setConversation(prev => [...prev, { speaker: 'ai', text: aiText }]);
    } catch (error) {
      console.error(error);
      setConversation(prev => [...prev, { speaker: 'ai', text: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] animate-fade-in">
      <div className="p-5 bg-black/20 rounded-xl mb-6 border border-white/10">
        <h3 className="font-bold text-lg text-ghost-white mb-2">상황 설명</h3>
        <p className="text-brand-gray leading-relaxed">{scenario.description}</p>
      </div>
      
      <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-5">
        {conversation.map((turn, index) => (
          <div key={index} className={`flex ${turn.speaker === 'leader' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl p-4 rounded-xl shadow-md ${turn.speaker === 'leader' ? 'bg-brand-blue text-white' : 'bg-slate-700/90 text-ghost-white'}`}>
              <p style={{ whiteSpace: 'pre-wrap' }} className="leading-relaxed">{turn.text}</p>
            </div>
          </div>
        ))}
        {isLoading && <div className="flex justify-start"><div className="p-4 rounded-xl bg-slate-700/90"><LoadingIndicator /></div></div>}
        <div ref={chatEndRef} />
      </div>

      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="flex items-center space-x-3 bg-slate-800/80 rounded-xl border border-slate-600 focus-within:ring-2 focus-within:ring-brand-blue transition-all">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={conversation.length === 0 ? '"AI, 단기적 손실 최소화 및 장기 경쟁력 유지 방안은?"' : 'AI에게 질문하기...'}
            className="flex-grow p-4 bg-transparent focus:outline-none text-ghost-white placeholder-gray-400 disabled:text-gray-500"
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading || !userInput.trim()} className="p-3 bg-brand-blue rounded-lg text-white disabled:bg-slate-500/50 transition-colors duration-300 hover:bg-blue-600 m-1">
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex justify-end space-x-4 mt-5">
           <button 
             onClick={() => onMakeDecision(conversation)}
             disabled={conversation.length === 0 || isLoading}
             className="inline-flex items-center px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-md hover:bg-green-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
           >
            최종 결정 내리기
            <CheckCircleIcon className="ml-2 w-5 h-5" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default Simulation;