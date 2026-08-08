import { Router } from 'express';
import { getAdminDashboard } from '../controllers/adminController.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';

const adminRoutes = Router();

adminRoutes.get('/dashboard', authenticate, authorize('ADMIN'), getAdminDashboard);

export default adminRoutes;
