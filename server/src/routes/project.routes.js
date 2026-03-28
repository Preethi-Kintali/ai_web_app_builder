import { Router } from 'express';
import {
  getProjects, createProject, getProject, updateProject, deleteProject,
  getVersions, restoreVersion, toggleShare,
} from '../controllers/project.controller.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Version history
router.get('/:id/versions', getVersions);
router.post('/:id/restore/:versionIndex', restoreVersion);

// Share toggle
router.patch('/:id/share', toggleShare);

export default router;
