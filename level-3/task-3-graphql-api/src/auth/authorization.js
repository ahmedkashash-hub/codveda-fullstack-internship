import { forbidden, unauthenticated } from '../utils/graphqlErrors.js';

export const requireAuth = (context) => {
  if (!context.auth) throw unauthenticated();
  return context.auth;
};

export const requireRole = (context, ...roles) => {
  const auth = requireAuth(context);
  if (!roles.includes(auth.role)) throw forbidden();
  return auth;
};
