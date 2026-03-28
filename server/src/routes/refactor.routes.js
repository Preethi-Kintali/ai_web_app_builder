import { Router } from 'express';
import { refactorCode } from '../controllers/refactor.controller.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

// POST /api/refactor/:projectId  { action: 'optimize' | 'make-responsive' | ... }
router.post('/:projectId', refactorCode);

export default router;
