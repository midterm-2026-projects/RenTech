import * as aiService from '../service/aiService.js';

export async function getAiInsights(req, res) {
  try {
    const { kpis } = req.body || {};
    const result = await aiService.getInsights(kpis || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message || 'Failed to generate AI insights',
      timestamp: new Date().toISOString(),
    });
  }
}

export async function postAiAssistant(req, res) {
  try {
    const { question, context } = req.body;
    const result = await aiService.postAssistant(question, context || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message || 'Failed to generate AI response',
      timestamp: new Date().toISOString(),
    });
  }
}
