import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  return process.env.JWT_SECRET;
};

const readBearerToken = (authorization) => {
  if (typeof authorization !== 'string') return null;
  const match = authorization.match(/^Bearer ([^\s]+)$/i);
  return match?.[1] ?? null;
};

export const authenticateRequest = (request) => {
  const token = readBearerToken(request.headers.authorization);
  if (!token) return null;

  try {
    const payload = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
    if (
      typeof payload !== 'object' ||
      typeof payload.sub !== 'string' ||
      !['USER', 'ADMIN'].includes(payload.role)
    ) {
      return null;
    }
    return { userId: payload.sub, role: payload.role };
  } catch {
    return null;
  }
};
