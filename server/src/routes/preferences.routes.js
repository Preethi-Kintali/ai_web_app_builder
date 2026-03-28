import { Router } from 'express';
import { getPreferences, updatePreferences } from '../controllers/preferences.controller.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

// GET /api/preferences
router.get('/', getPreferences);

// PUT /api/preferences  { theme, framework, codeStyle, preferredLibraries, colorScheme }
router.put('/', updatePreferences);

export default router;
