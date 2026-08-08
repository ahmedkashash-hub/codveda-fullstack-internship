import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';

const authenticate = (request, _response, next) => {
  const authorization = request.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return next(new AppError('Authentication required', 401));
  }

  if (!process.env.JWT_SECRET) {
    return next(new AppError('Authentication is not configured', 500));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    if (
      typeof payload !== 'object' ||
      typeof payload.sub !== 'string' ||
      !['USER', 'ADMIN'].includes(payload.role)
    ) {
      throw new Error('Invalid token payload');
    }

    request.auth = {
      userId: payload.sub,
      role: payload.role,
    };

    return next();
  } catch {
    return next(new AppError('Invalid or expired token', 401));
  }
};

export default authenticate;
