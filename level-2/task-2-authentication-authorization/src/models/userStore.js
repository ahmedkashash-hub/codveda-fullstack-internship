const users = []

function findByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase()
  return users.find((user) => user.email === normalizedEmail)
}

function findById(id) {
  return users.find((user) => user.id === id)
}

function create(user) {
  users.push(user)
  return user
}

export { create, findByEmail, findById }
