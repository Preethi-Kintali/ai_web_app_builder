import { Router } from 'express';
import * as pairController from '../controllers/pairProgrammer.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

// All pair mode routes are protected by JWT
router.use(authMiddleware);

router.post('/', pairController.handlePairRequest);

export default router;
