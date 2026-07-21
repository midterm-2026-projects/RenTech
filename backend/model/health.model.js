import { testConnection } from '../config/database.js';
import { env } from '../config/env.js';

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_TIMEOUT_MS = 5000;

export async function checkDatabase() {
  try {
    const result = await testConnection();
    if (result && result.ok) {
      return { status: 'healthy', message: result.message };
    }
    return {
      status: 'unhealthy',
      message: result?.message || 'Database connection failed',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error?.message || 'Database connection failed',
    };
  }
}

export async function checkGemini() {
  if (!env.GEMINI_API_KEY) {
    return { status: 'unhealthy', message: 'Gemini API key not configured' };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'health check' }] }],
          generationConfig: { maxOutputTokens: 1 },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        status: 'unhealthy',
        message: `Gemini API returned ${response.status}`,
      };
    }

    return { status: 'healthy', message: 'Gemini reachable' };
  } catch (error) {
    const message =
      error?.name === 'AbortError'
        ? `Gemini health check timed out after ${GEMINI_TIMEOUT_MS}ms`
        : error?.message || 'Gemini unreachable';
    return { status: 'unhealthy', message };
  }
}

export async function getHealth() {
  const [database, gemini] = await Promise.all([checkDatabase(), checkGemini()]);

  const components = { database, gemini };
  const allHealthy = Object.values(components).every((c) => c.status === 'healthy');

  return {
    status: allHealthy ? 'ok' : 'service_unavailable',
    timestamp: new Date().toISOString(),
    components,
  };
}
