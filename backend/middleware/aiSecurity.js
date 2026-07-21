import { validatePrompt, sanitizeInput } from '../utils/promptBuilder.js';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

const ipRequestCounts = new Map();
const blockedIps = new Map();

function cleanupOldEntries() {
  const now = Date.now();
  
  for (const [ip, timestamps] of ipRequestCounts.entries()) {
    const validTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
    if (validTimestamps.length === 0) {
      ipRequestCounts.delete(ip);
    } else {
      ipRequestCounts.set(ip, validTimestamps);
    }
  }

  for (const [ip, blockedUntil] of blockedIps.entries()) {
    if (now > blockedUntil) {
      blockedIps.delete(ip);
    }
  }
}

setInterval(cleanupOldEntries, RATE_LIMIT_WINDOW_MS);

function getClientIp(req) {
  return req.ip 
    || req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.socket?.remoteAddress
    || 'unknown';
}

function logBlockedRequest(ip, reason) {
  const timestamp = new Date().toISOString();
  console.log(`[SECURITY] ${timestamp} - Blocked IP: ${ip} - Reason: ${reason}`);
}

export function aiRateLimiter(req, res, next) {
  const ip = getClientIp(req);
  const now = Date.now();

  if (blockedIps.has(ip) && blockedIps.get(ip) > now) {
    logBlockedRequest(ip, 'Rate limit exceeded (blocked)');
    return res.status(429).json({
      error: 'Too many requests',
      code: 'RATE_LIMITED',
      retryAfter: Math.ceil((blockedIps.get(ip) - now) / 1000),
    });
  }

  const timestamps = ipRequestCounts.get(ip) || [];
  const recentRequests = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    blockedIps.set(ip, now + RATE_LIMIT_WINDOW_MS);
    logBlockedRequest(ip, `Rate limit exceeded: ${recentRequests.length} requests in ${RATE_LIMIT_WINDOW_MS/1000}s`);
    return res.status(429).json({
      error: 'Too many requests',
      code: 'RATE_LIMITED',
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
    });
  }

  recentRequests.push(now);
  ipRequestCounts.set(ip, recentRequests);

  next();
}

const SUSPICIOUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<form/gi,
  /<input/gi,
  /eval\s*\(/gi,
  /Function\s*\(/gi,
  /setTimeout\s*\(/gi,
  /setInterval\s*\(/gi,
  /document\./gi,
  /window\./gi,
  /alert\s*\(/gi,
  /prompt\s*\(/gi,
  /confirm\s*\(/gi,
];

function containsSuspiciousContent(text) {
  if (!text || typeof text !== 'string') return false;
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(text));
}

export function aiInputValidator(req, res, next) {
  const ip = getClientIp(req);
  
  const checkValue = (value, fieldName) => {
    if (typeof value === 'string') {
      if (containsSuspiciousContent(value)) {
        logBlockedRequest(ip, `Suspicious content in field: ${fieldName}`);
        return res.status(400).json({
          error: 'Invalid input detected',
          code: 'SUSPICIOUS_INPUT',
          field: fieldName,
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      for (const [key, val] of Object.entries(value)) {
        const result = checkValue(val, `${fieldName}.${key}`);
        if (result) return result;
      }
    }
    return null;
  };

  for (const [key, value] of Object.entries(req.body || {})) {
    const result = checkValue(value, key);
    if (result) return result;
  }

  for (const [key, value] of Object.entries(req.query || {})) {
    const result = checkValue(value, `query.${key}`);
    if (result) return result;
  }

  next();
}

export function aiPromptValidator(req, res, next) {
  const { prompt, question, kpis } = req.body;
  
  const textToValidate = prompt || question || JSON.stringify(kpis || {});
  
  const validation = validatePrompt(textToValidate);
  if (!validation.valid) {
    const ip = getClientIp(req);
    logBlockedRequest(ip, `Prompt validation failed: ${validation.error}`);
    return res.status(400).json({
      error: validation.error,
      code: 'INVALID_PROMPT',
    });
  }

  if (prompt) req.body.prompt = sanitizeInput(prompt);
  if (question) req.body.question = sanitizeInput(question);

  next();
}

export function getRateLimitStatus(ip) {
  const now = Date.now();
  const timestamps = ipRequestCounts.get(ip) || [];
  const recentRequests = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  const isBlocked = blockedIps.has(ip) && blockedIps.get(ip) > now;
  
  return {
    ip,
    requestsInWindow: recentRequests.length,
    maxRequests: RATE_LIMIT_MAX_REQUESTS,
    windowMs: RATE_LIMIT_WINDOW_MS,
    blocked: isBlocked,
    blockedUntil: isBlocked ? blockedIps.get(ip) : null,
  };
}

export function resetRateLimit(ip) {
  ipRequestCounts.delete(ip);
  blockedIps.delete(ip);
}