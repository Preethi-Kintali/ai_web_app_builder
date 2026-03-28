import * as refactorService from '../services/refactor.service.js';

export const refactorCode = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { action } = req.body;

    if (!action) {
      return res.status(400).json({ success: false, message: 'Refactor action is required.' });
    }

    const result = await refactorService.refactorCode(projectId, req.user.id, action);
    return res.json({ success: true, data: result });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};
