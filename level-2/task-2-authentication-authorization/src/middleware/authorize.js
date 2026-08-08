import AppError from '../utils/AppError.js'

function authorize(...allowedRoles) {
  return function checkAuthorization(request, response, next) {
    if (!request.auth) {
      return next(new AppError('Authentication required', 401))
    }

    if (!allowedRoles.includes(request.auth.role)) {
      return next(new AppError('Forbidden', 403))
    }

    return next()
  }
}

export default authorize
