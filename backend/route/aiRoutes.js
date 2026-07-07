import { validateRequest } from '../middleware/requestValidator.js';
import * as aiController from '../controller/aiController.js';

export function registerAiRoutes(router) {
  router.get('/ai/insights', aiController.getAiInsights);

  router.post(
    '/ai/assistant',
    validateRequest([
      { name: 'question', type: 'string', required: true },
    ]),
    aiController.postAiAssistant
  );
}
