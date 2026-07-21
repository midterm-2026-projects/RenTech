import { randomUUID } from 'crypto';

const SENSITIVE_KEY_PATTERNS = [
  /^password$/i,
  /passwd/i,
  /secret/i,
  /token/i,
  /api[-_]?key/i,
  /authorization/i,
  /auth/i,
  /\bpat\b/i,
  /credential/i,
  /session/i,
];

function isSensitiveKey(key) {
  if (typeof key !== 'string') return false;
  return SENSITIVE_KEY_PATTERNS.some((re) => re.test(key));
}

function redactSensitive(value, depth = 0) {
  if (depth > 8) return value;
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item, depth + 1));
  }

  if (typeof value === 'object') {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      if (isSensitiveKey(key)) {
        out[key] = '[REDACTED]';
      } else {
        out[key] = redactSensitive(val, depth + 1);
      }
    }
    return out;
  }

  return value;
}

function truncate(value, max = 2000) {
  if (typeof value === 'string' && value.length > max) {
    return value.slice(0, max) + `… (truncated ${value.length - max} chars)`;
  }
  return value;
}

export function requestLogger(req, res, next) {
  const requestId = randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  const start = process.hrtime.bigint();

  let capturedJson = undefined;
  let capturedSend = undefined;
  const passJson = res.json.bind(res);
  res.json = (body) => {
    capturedJson = body;
    return passJson(body);
  };
  const passSend = res.send.bind(res);
  res.send = (body) => {
    capturedSend = body;
    return passSend(body);
  };

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const status = res.statusCode;

    let rawBody = capturedJson !== undefined ? capturedJson : capturedSend;
    if (typeof rawBody === 'string') {
      try {
        rawBody = JSON.parse(rawBody);
      } catch {
        rawBody = { body: truncate(rawBody) };
      }
    }

    const logEntry = {
      level: status >= 500 ? 'error' : 'info',
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      status,
      durationMs: Math.round(durationMs * 100) / 100,
      query: redactSensitive(req.query || {}),
      body: redactSensitive(req.body || {}),
    };

    if (status >= 500) {
      logEntry.error = redactSensitive(rawBody);
      console.error(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  });

  next();
}

export function errorLogger(err, req, res, next) {
  const requestId = req.requestId || 'unknown';

  console.error(
    JSON.stringify({
      level: 'error',
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      error: {
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
      },
    })
  );

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({ error: 'Internal Server Error', requestId });
}

export { redactSensitive };
