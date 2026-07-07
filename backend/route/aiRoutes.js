import { validateRequest } from '../middleware/requestValidator.js';

export async function getAiInsights(req, res) {
  res.json({
    status: 'success',
    message: 'AI insights endpoint is operational',
    timestamp: new Date().toISOString(),
  });
}

export async function postAiAssistant(req, res) {
  const { question } = req.body;

  res.json({
    status: 'success',
    answer: `Placeholder: Your question "${question}" has been received. AI assistant integration is in progress.`,
    timestamp: new Date().toISOString(),
  });
}

export function registerAiRoutes(router) {
  router.get('/ai/insights', getAiInsights);

  router.post(
    '/ai/assistant',
    validateRequest([
      { name: 'question', type: 'string', required: true },
    ]),
    postAiAssistant
  );
}
