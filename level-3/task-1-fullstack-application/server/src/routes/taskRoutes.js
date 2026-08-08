import { Router } from 'express';
import {
  create,
  getOne,
  list,
  remove,
  update,
} from '../controllers/taskController.js';
import authenticate from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);
router.route('/').post(create).get(list);
router.route('/:id').get(getOne).patch(update).delete(remove);

export default router;
