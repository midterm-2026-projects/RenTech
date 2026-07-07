import * as aiService from '../service/aiService.js';

export async function getAiInsights(req, res) {
  const result = aiService.getInsights();
  res.json(result);
}

export async function postAiAssistant(req, res) {
  const { question } = req.body;
  const result = aiService.postAssistant(question);
  res.json(result);
}
