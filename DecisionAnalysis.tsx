import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { ShareIcon } from './icons/ShareIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { ArchiveBoxArrowDownIcon } from './icons/ArchiveBoxArrowDownIcon';

// Declare esbuild on the window object to avoid TypeScript errors
declare global {
    interface Window {
        esbuild: any;
    }
}

interface DecisionAnalysisProps {
  analysis: AnalysisResult | null;
  decisionSpeed: string;
  onRestart: () => void;
  isLoading: boolean;
}

const StatCard: React.FC<{ title: string; value: string; colorClass: string }> = ({ title, value, colorClass }) => (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl text-center shadow-lg border border-slate-700/80">
        <h4 className="text-md font-semibold text-brand-gray mb-2">{title}</h4>
        <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-brand-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h2 className="text-2xl font-semibold mt-4 text-ghost-white">의사결정 분석 중...</h2>
        <p className="text-brand-gray mt-2 text-lg">AI가 대화 내용을 바탕으로 리더십을 분석하고 있습니다.</p>
    </div>
);

const DecisionAnalysis: React.FC<DecisionAnalysisProps> = ({ analysis, decisionSpeed, onRestart, isLoading }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadApp = async () => {
        setIsDownloading(true);

        try {
            const files = {
                'index.tsx': `
                    import React from 'react';
                    import ReactDOM from 'react-dom/client';
                    import App from './App';

                    const rootElement = document.getElementById('root');
                    if (!rootElement) {
                      throw new Error("Could not find root element to mount to");
                    }

                    const root = ReactDOM.createRoot(rootElement);
                    root.render(
                      <React.StrictMode>
                        <App />
                      </React.StrictMode>
                    );`,
                'App.tsx': (await fetch(new URL('../App.tsx', import.meta.url)).then(res => res.text())),
                'types.ts': (await fetch(new URL('../types.ts', import.meta.url)).then(res => res.text())),
                'services/geminiService.ts': (await fetch(new URL('../services/geminiService.ts', import.meta.url)).then(res => res.text())),
                'components/ScenarioSelection.tsx': (await fetch(new URL('./ScenarioSelection.tsx', import.meta.url)).then(res => res.text())),
                'components/Simulation.tsx': (await fetch(new URL('./Simulation.tsx', import.meta.url)).then(res => res.text())),
                'components/DecisionAnalysis.tsx': (await fetch(new URL('./DecisionAnalysis.tsx', import.meta.url)).then(res => res.text())),
                'components/icons/ArrowRightIcon.tsx': (await fetch(new URL('./icons/ArrowRightIcon.tsx', import.meta.url)).then(res => res.text())),
                'components/icons/PaperAirplaneIcon.tsx': (await fetch(new URL('./icons/PaperAirplaneIcon.tsx', import.meta.url)).then(res => res.text())),
                'components/icons/CheckCircleIcon.tsx': (await fetch(new URL('./icons/CheckCircleIcon.tsx', import.meta.url)).then(res => res.text())),
                'components/icons/DownloadIcon.tsx': (await fetch(new URL('./icons/DownloadIcon.tsx', import.meta.url)).then(res => res.text())),
                'components/icons/ShareIcon.tsx': (await fetch(new URL('./icons/ShareIcon.tsx', import.meta.url)).then(res => res.text())),
                'components/icons/ArrowPathIcon.tsx': (await fetch(new URL('./icons/ArrowPathIcon.tsx', import.meta.url)).then(res => res.text())),
                'components/icons/ArchiveBoxArrowDownIcon.tsx': (await fetch(new URL('./icons/ArchiveBoxArrowDownIcon.tsx', import.meta.url)).then(res => res.text())),
            };

            const htmlTemplate = (bundledJs: string) => `
                <!DOCTYPE html>
                <html lang="en">
                  <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>LG Chem | Agile Decision Simulator</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
                    <script>
                      tailwind.config = {
                        theme: {
                          extend: {
                            fontFamily: { sans: ['Noto Sans KR', 'sans-serif'] },
                            colors: {
                              'brand-blue': '#0033A0', 'brand-red': '#A50034', 'brand-gray': '#A8A9AD',
                              'night-sky': '#111827', 'slate-gray': '#374151', 'light-slate': '#4B5563', 'ghost-white': '#F9FAFB',
                            },
                          }
                        }
                      }
                    </script>
                    <style> body { font-family: 'Noto Sans KR', sans-serif; } </style>
                  </head>
                  <body class="text-ghost-white">
                    <div class="fixed inset-0 -z-10 h-full w-full bg-cover bg-center bg-fixed" style="background-image: url('https://images.unsplash.com/photo-1590396113854-35368a0a9e70?q=80&w=2574&auto=format&fit=crop')"></div>
                    <div class="fixed inset-0 -z-10 h-full w-full bg-gray-900/70"></div>
                    <div id="root" class="relative z-0"></div>
                    <script>${bundledJs}</script>
                  </body>
                </html>
            `;

            if (!window.esbuild) {
                const script = document.createElement('script');
                script.src = 'https://esm.sh/esbuild-wasm@0.23.0';
                document.head.appendChild(script);
                await new Promise(resolve => { script.onload = resolve; });
                await window.esbuild.initialize({
                    wasmURL: 'https://esm.sh/esbuild-wasm@0.23.0/esbuild.wasm',
                    worker: true,
                });
            }
            
            const result = await window.esbuild.build({
                entryPoints: ['index.tsx'],
                bundle: true,
                write: false,
                format: 'iife',
                globalName: 'LGChemSim',
                loader: { '.tsx': 'tsx', '.ts': 'ts' },
                plugins: [{
                    name: 'in-memory-loader',
                    setup(build) {
                        build.onResolve({ filter: /.*/ }, args => {
                            if (args.kind === 'entry-point') return { path: args.path, namespace: 'mem-fs' };
                            const path = new URL(args.path, `file:///${args.importer}`).pathname.substring(1);
                            const extensions = ['.ts', '.tsx', ''];
                            for (const ext of extensions) {
                                if (files[`${path}${ext}`]) return { path: `${path}${ext}`, namespace: 'mem-fs' };
                            }
                            return { path: args.path, external: true };
                        });
                        build.onLoad({ filter: /.*/, namespace: 'mem-fs' }, args => {
                            const content = files[args.path];
                            if (content === undefined) throw new Error(`Could not find file: ${args.path}`);
                            return { contents: content, loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts' };
                        });
                    }
                }],
                define: {
                  'process.env.API_KEY': `prompt("이 시뮬레이터를 실행하려면 Google Gemini API 키가 필요합니다.\\n\\nAPI 키를 입력해주세요:")`,
                },
            });

            const bundledJs = result.outputFiles[0].text;
            const finalHtml = htmlTemplate(bundledJs);
            const blob = new Blob([finalHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Agile_Decision_Simulator.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Failed to create downloadable app:", error);
            alert("앱 다운로드에 실패했습니다. 브라우저 콘솔을 확인해주세요.");
        } finally {
            setIsDownloading(false);
        }
    };
    
    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!analysis) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-bold text-red-400">분석 결과를 불러올 수 없습니다.</h2>
                <p className="text-brand-gray mt-2">네트워크 오류 또는 예기치 않은 문제 발생</p>
                <button onClick={onRestart} className="mt-8 inline-flex items-center px-8 py-3 bg-brand-blue text-white font-bold rounded-xl shadow-md hover:bg-blue-600 transition-all duration-300">
                    <ArrowPathIcon className="mr-2 w-5 h-5" />
                    다시 시작하기
                </button>
            </div>
        );
    }
    
    const { riskAppetite, expectedOutcome, additionalSuggestions } = analysis;

    const getRiskAppetiteColor = (appetite: AnalysisResult['riskAppetite']) => {
        switch (appetite) {
            case '높음': return 'text-red-400';
            case '중간': return 'text-yellow-400';
            case '낮음': return 'text-green-400';
            case '정보 부족': return 'text-brand-gray';
            default: return 'text-ghost-white';
        }
    };

  return (
    <div className="flex flex-col h-full animate-fade-in justify-between">
        <div>
            <h2 className="text-2xl font-bold text-center mb-8 text-ghost-white">의사결정 분석 리포트</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <StatCard title="의사결정 속도" value={decisionSpeed} colorClass="text-ghost-white" />
                <StatCard title="리스크 감수 성향" value={riskAppetite} colorClass={getRiskAppetiteColor(riskAppetite)} />
                <StatCard title="예상 성과" value={expectedOutcome} colorClass="text-green-400" />
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl flex-grow border border-slate-700/80">
                <h4 className="font-bold text-brand-gray text-md mb-3">AI 추가 제안</h4>
                <ul className="space-y-3 list-disc list-inside text-ghost-white text-base">
                    {additionalSuggestions.map((suggestion, index) => (
                        <li key={index} className="leading-relaxed">{suggestion}</li>
                    ))}
                </ul>
            </div>
        </div>
      
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-8">
            <button onClick={handleDownloadApp} disabled={isDownloading} className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3 bg-brand-blue text-white font-bold rounded-xl shadow-md hover:bg-blue-600 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-wait">
                <ArchiveBoxArrowDownIcon className="mr-2 w-5 h-5" />
                {isDownloading ? '생성 중...' : 'HTML로 저장'}
            </button>
             <button onClick={onRestart} className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3 bg-slate-700 text-white font-bold rounded-xl shadow-md hover:bg-slate-600 transition-all duration-300">
                <ArrowPathIcon className="mr-2 w-5 h-5" />
                다른 시나리오 선택
            </button>
        </div>
    </div>
  );
};

export default DecisionAnalysis;
