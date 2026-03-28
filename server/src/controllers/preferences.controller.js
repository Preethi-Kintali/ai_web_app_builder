import * as preferencesService from '../services/preferences.service.js';

export const getPreferences = async (req, res, next) => {
  try {
    const prefs = await preferencesService.getUserPreferences(req.user.id);
    return res.json({ success: true, data: prefs });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const prefs = await preferencesService.updateUserPreferences(req.user.id, req.body);
    return res.json({ success: true, data: prefs });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};
