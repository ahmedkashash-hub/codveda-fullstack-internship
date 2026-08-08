import { toSafeUser } from '../models/User.js'
import { findById } from '../models/userStore.js'
import AppError from '../utils/AppError.js'

function getProfile(request, response, next) {
  const user = findById(request.auth.userId)

  if (!user) {
    return next(new AppError('Authentication required', 401))
  }

  return response.status(200).json({
    user: toSafeUser(user),
  })
}

export { getProfile }
