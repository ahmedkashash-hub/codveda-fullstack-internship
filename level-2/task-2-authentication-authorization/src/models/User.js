import { randomUUID } from 'node:crypto'

const allowedRoles = new Set(['user', 'admin'])

function createUser({ name, email, passwordHash, role = 'user' }) {
  if (!allowedRoles.has(role)) {
    throw new Error('Invalid user role')
  }

  return {
    id: randomUUID(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  }
}

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  }
}

export { toSafeUser }
export default createUser
