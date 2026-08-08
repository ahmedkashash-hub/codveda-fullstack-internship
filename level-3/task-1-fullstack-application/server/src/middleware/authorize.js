import AppError from '../utils/AppError.js';

const authorize = (...allowedRoles) => (request, _response, next) => {
  if (!request.auth) {
    return next(new AppError('Authentication required', 401));
  }

  if (!allowedRoles.includes(request.auth.role)) {
    return next(new AppError('Forbidden', 403));
  }

  return next();
};

export default authorize;
