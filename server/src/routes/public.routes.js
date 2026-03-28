import { Router } from 'express';
import { getPublicProject } from '../controllers/public.controller.js';

const router = Router();

// No auth required
router.get('/:id', getPublicProject);

export default router;
