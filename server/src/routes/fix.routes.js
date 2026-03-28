import { Router } from 'express';
import { fixCode } from '../controllers/fix.controller.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);
router.post('/:projectId', fixCode);

export default router;
