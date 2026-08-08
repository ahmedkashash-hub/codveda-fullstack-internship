import jwt from 'jsonwebtoken'
import { getJwtSecret } from '../config/authConfig.js'
import AppError from '../utils/AppError.js'

function authenticate(request, response, next) {
  const authorization = request.get('authorization')

  if (!authorization) {
    return next(new AppError('Authentication required', 401))
  }

  const [scheme, token, ...extraParts] = authorization.trim().split(/\s+/)

  if (scheme?.toLowerCase() !== 'bearer' || !token || extraParts.length > 0) {
    return next(new AppError('Authentication required', 401))
  }

  const secret = getJwtSecret()

  try {
    const payload = jwt.verify(token, secret)

    if (
      typeof payload !== 'object' ||
      typeof payload.sub !== 'string' ||
      typeof payload.role !== 'string'
    ) {
      throw new Error('Invalid token payload')
    }

    request.auth = {
      userId: payload.sub,
      role: payload.role,
    }

    return next()
  } catch {
    return next(new AppError('Invalid or expired token', 401))
  }
}

export default authenticate
