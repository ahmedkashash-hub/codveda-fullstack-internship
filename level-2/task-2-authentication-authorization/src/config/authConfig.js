function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim()

  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }

  return secret
}

function getJwtConfig() {
  return {
    secret: getJwtSecret(),
    expiresIn: process.env.JWT_EXPIRES_IN?.trim() || '1h',
  }
}

export { getJwtConfig, getJwtSecret }
