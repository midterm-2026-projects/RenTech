import { randomUUID } from 'crypto';

const MAX_ALERTS = 100;

const alerts = [];

export function raiseAlert({ component, severity = 'critical', message, details } = {}) {
  const alert = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    component: component || 'unknown',
    severity: severity || 'critical',
    message: message || '',
    details: details || null,
  };

  alerts.unshift(alert);
  if (alerts.length > MAX_ALERTS) {
    alerts.length = MAX_ALERTS;
  }

  console.error(
    JSON.stringify({
      level: 'alert',
      alertId: alert.id,
      timestamp: alert.timestamp,
      component: alert.component,
      severity: alert.severity,
      message: alert.message,
      details: alert.details,
    })
  );

  return alert;
}

export function checkAndAlert(healthResult) {
  const unhealthy = Object.entries(healthResult.components || {}).filter(
    ([, component]) => component.status !== 'healthy'
  );

  for (const [name, component] of unhealthy) {
    raiseAlert({
      component: name,
      severity: 'critical',
      message: `${name} is ${component.status}: ${component.message}`,
      details: { status: component.status, message: component.message },
    });
  }

  return unhealthy;
}

export function getAlerts(limit = 50) {
  return alerts.slice(0, limit);
}

export function clearAlerts() {
  alerts.length = 0;
}
