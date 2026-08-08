import express from 'express'
import adminRouter from './routes/adminRoutes.js'
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js'
import AppError from './utils/AppError.js'

const app = express()

app.use(express.json())

app.get('/health', (request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'authentication-api',
  })
})

app.use('/api/admin', adminRouter)
app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)

app.use((request, response, next) => {
  next(new AppError('Route not found', 404))
})

app.use((error, request, response, next) => {
  const isInvalidJson = error.type === 'entity.parse.failed'
  const statusCode = isInvalidJson ? 400 : error.statusCode || 500
  const message = isInvalidJson
    ? 'Request body contains invalid JSON'
    : error.statusCode
      ? error.message
      : 'Internal server error'

  response.status(statusCode).json({ message })
})

export default app
