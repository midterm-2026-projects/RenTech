import { chatWithAi, generateReport } from './geminiService.js';

export async function getInsights(kpis = {}) {
  const result = await generateReport({ kpis });

  return {
    status: 'success',
    insights: [result.report],
    prompt: JSON.stringify(kpis),
    timestamp: new Date().toISOString(),
  };
}

export async function postAssistant(question, context = {}) {
  const result = await chatWithAi(question);

  return {
    status: 'success',
    answer: result.reply,
    timestamp: new Date().toISOString(),
  };
}
