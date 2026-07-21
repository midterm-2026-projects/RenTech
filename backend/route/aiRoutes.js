import { validateRequest } from '../middleware/requestValidator.js';
import { aiRateLimiter, aiInputValidator, aiPromptValidator } from '../middleware/aiSecurity.js';
import * as aiController from '../controller/aiController.js';

export function registerAiRoutes(router) {
  router.get('/ai/insights', aiRateLimiter, aiController.getAiInsights);

  router.post(
    '/ai/assistant',
    aiRateLimiter,
    aiInputValidator,
    validateRequest([
      { name: 'question', type: 'string', required: true },
    ]),
    aiPromptValidator,
    aiController.postAiAssistant
  );

  router.post(
    '/ai/insights',
    aiRateLimiter,
    aiInputValidator,
    aiPromptValidator,
    aiController.getAiInsights
  );
}
