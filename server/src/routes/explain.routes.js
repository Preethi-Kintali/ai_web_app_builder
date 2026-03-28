import { Router } from 'express';
import { explainCode } from '../controllers/explain.controller.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);
router.post('/:projectId', explainCode);

export default router;
