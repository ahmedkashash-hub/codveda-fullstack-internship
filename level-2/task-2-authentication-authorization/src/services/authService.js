import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { getJwtConfig } from '../config/authConfig.js'
import createUser, { toSafeUser } from '../models/User.js'
import { create, findByEmail } from '../models/userStore.js'
import AppError from '../utils/AppError.js'

const SALT_ROUNDS = 10
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password'

function validateRegistration({ name, email, password }) {
  if (typeof name !== 'string' || name.trim().length < 2) {
    throw new AppError('Name must be at least 2 characters long', 400)
  }

  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    throw new AppError('A valid email address is required', 400)
  }

  if (typeof password !== 'string' || password.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400)
  }
}

async function registerUser(payload = {}) {
  const { name, email, password } = payload || {}

  validateRegistration({ name, email, password })

  const normalizedEmail = email.trim().toLowerCase()

  if (findByEmail(normalizedEmail)) {
    throw new AppError('An account with this email already exists', 409)
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = createUser({
    name,
    email: normalizedEmail,
    passwordHash,
  })

  create(user)
  return toSafeUser(user)
}

async function loginUser(payload = {}) {
  const { email, password } = payload || {}

  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    throw new AppError('A valid email address is required', 400)
  }

  if (typeof password !== 'string' || password.length === 0) {
    throw new AppError('Password is required', 400)
  }

  const normalizedEmail = email.trim().toLowerCase()
  const user = findByEmail(normalizedEmail)

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401)
  }

  const { secret, expiresIn } = getJwtConfig()
  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    secret,
    { expiresIn },
  )

  return {
    user: toSafeUser(user),
    token,
  }
}

export { loginUser, registerUser }
