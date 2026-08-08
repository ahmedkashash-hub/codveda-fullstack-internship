import { loginUser, registerUser } from '../services/authService.js'

async function register(request, response, next) {
  try {
    const user = await registerUser(request.body)

    response.status(201).json({
      message: 'User registered successfully',
      user,
    })
  } catch (error) {
    next(error)
  }
}

async function login(request, response, next) {
  try {
    const { user, token } = await loginUser(request.body)

    response.status(200).json({
      message: 'Login successful',
      user,
      token,
    })
  } catch (error) {
    next(error)
  }
}

export { login, register }
