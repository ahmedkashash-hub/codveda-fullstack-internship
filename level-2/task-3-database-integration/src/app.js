import express from 'express'
import prisma from './config/prisma.js'
import categoryRouter from './routes/categoryRoutes.js'
import productRouter from './routes/productRoutes.js'
import AppError from './utils/AppError.js'

const app = express()

app.use(express.json())

app.get('/health', async (request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`

    response.status(200).json({
      status: 'ok',
      database: 'postgresql',
      orm: 'prisma',
    })
  } catch {
    response.status(503).json({
      status: 'unavailable',
      database: 'postgresql',
      orm: 'prisma',
    })
  }
})

app.use('/api/categories', categoryRouter)
app.use('/api/products', productRouter)

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
