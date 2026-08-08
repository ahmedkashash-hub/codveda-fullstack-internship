import { Router } from 'express'
import { getDashboard } from '../controllers/adminController.js'
import authenticate from '../middleware/authenticate.js'
import authorize from '../middleware/authorize.js'

const adminRouter = Router()

adminRouter.get('/dashboard', authenticate, authorize('admin'), getDashboard)

export default adminRouter
