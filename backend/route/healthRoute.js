import { getHealthStatus, getHealthAlerts } from '../controller/healthController.js';

export function registerHealthRoutes(router) {
  router.get('/health', getHealthStatus);
  router.get('/health/alerts', getHealthAlerts);
}
