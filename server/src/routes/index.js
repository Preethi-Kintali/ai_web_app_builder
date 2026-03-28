import { Router } from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.routes.js';
import generationRoutes from './generation.routes.js';
import explainRoutes from './explain.routes.js';
import fixRoutes from './fix.routes.js';
import publicRoutes from './public.routes.js';
import refactorRoutes from './refactor.routes.js';
import deployRoutes from './deploy.routes.js';
import preferencesRoutes from './preferences.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/generate', generationRoutes);
router.use('/explain', explainRoutes);
router.use('/fix', fixRoutes);
router.use('/public', publicRoutes);
router.use('/refactor', refactorRoutes);
router.use('/deploy', deployRoutes);
router.use('/preferences', preferencesRoutes);

export default router;
