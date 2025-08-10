
import { GoogleGenAI, Type } from "@google/genai";
import { Scenario, ConversationTurn, AnalysisResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        riskAppetite: {
            type: Type.STRING,
            description: "리더의 리스크 감수 성향. '낮음', '중간', '높음' 중 하나로 평가. 만약 판단하기에 정보가 부족하다면 '정보 부족'으로 평가.",
            enum: ['낮음', '중간', '높음', '정보 부족'],
        },
        expectedOutcome: {
            type: Type.STRING,
            description: "AI가 분석한 리더의 의사결정에 따른 예상 성과. '단기 손실 -X%, 장기 마진 +Y%' 형식으로 구체적인 수치를 포함하여 작성."
        },
        additionalSuggestions: {
            type: Type.ARRAY,
            description: "결정의 효과를 높이거나 리스크를 줄이기 위한 2-3가지 구체적인 추가 제안.",
            items: { type: Type.STRING }
        }
    },
    required: ["riskAppetite", "expectedOutcome", "additionalSuggestions"]
};


export const getAiResponse = async (scenario: Scenario, conversation: ConversationTurn[], newUserQuery: string): Promise<string> => {
    const model = 'gemini-2.5-flash';

    const systemInstruction = `You are an expert business consultant and strategic advisor for a senior leader at LG Chem. Your name is 'AI Agent'. Provide concise, actionable advice based on the given scenario and user query. Structure your response into short-term and long-term recommendations if applicable. The user is Korean, so respond in Korean.`;

    const history = conversation.map(turn => ({
        role: turn.speaker === 'leader' ? 'user' : 'model',
        parts: [{ text: turn.text }]
    }));

    const chat = ai.chats.create({
        model: model,
        config: { systemInstruction },
        history: history,
    });

    const response = await chat.sendMessage({ message: `시나리오: "${scenario.title}: ${scenario.description}".\n\n내 질문: "${newUserQuery}"` });

    return response.text;
};

export const getDecisionAnalysis = async (scenario: Scenario, conversation: ConversationTurn[]): Promise<AnalysisResult> => {
    const model = 'gemini-2.5-flash';
    const conversationText = conversation.map(turn => `${turn.speaker === 'leader' ? '리더' : 'AI'}: ${turn.text}`).join('\n');

    const prompt = `
        다음은 LG화학의 한 리더와 AI 에이전트 간의 의사결정 시뮬레이션 대화 내용입니다.

        시나리오: "${scenario.title}: ${scenario.description}"

        대화 내용:
        ${conversationText}

        위 대화 내용을 바탕으로 리더의 의사결정 과정을 분석하여 아래 JSON 스키마에 맞춰 결과를 반환해 주세요.
        - riskAppetite: 대화에서 드러난 리더의 위험 감수 성향을 평가합니다.
        - expectedOutcome: 리더의 최종적인 방향성에 기반하여 단기 및 장기적 성과를 구체적인 수치로 예측합니다.
        - additionalSuggestions: 의사결정을 보완하거나 실행력을 높일 수 있는 구체적인 추가 아이디어 2~3가지를 제안합니다.
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
        },
    });

    try {
        const jsonText = response.text.trim();
        const parsedResult: AnalysisResult = JSON.parse(jsonText);
        return parsedResult;
    } catch (e) {
        console.error("Failed to parse analysis JSON:", e, "Raw text:", response.text);
        throw new Error("AI 응답을 분석하는 데 실패했습니다.");
    }
};
