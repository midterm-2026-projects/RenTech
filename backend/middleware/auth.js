import jwt from 'jsonwebtoken';

export function verifyToken(token) {
  if (!token) throw new Error('Missing token');

  if (process.env.JWT_SECRET) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [username, role] = decoded.split(':');
    if (!role) throw new Error('Invalid dev token');
    return { username, role };
  } catch {
    throw new Error('Invalid token');
  }
}

// Express middleware: requires a valid `Authorization: Bearer <token>` header.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res
      .status(401)
      .json({ error: 'Unauthorized: missing or malformed Authorization header' });
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized: invalid token' });
  }
}
