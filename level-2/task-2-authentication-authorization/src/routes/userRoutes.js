import { Router } from 'express'
import { getProfile } from '../controllers/userController.js'
import authenticate from '../middleware/authenticate.js'

const userRouter = Router()

userRouter.get('/me', authenticate, getProfile)

export default userRouter
