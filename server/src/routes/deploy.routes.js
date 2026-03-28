import { Router } from 'express';
import { deployProject, getDeployStatus } from '../controllers/deploy.controller.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

// POST /api/deploy/:projectId  — trigger deployment
router.post('/:projectId', deployProject);

// GET /api/deploy/:projectId/status — poll deployment status
router.get('/:projectId/status', getDeployStatus);

export default router;
