import * as fixService from '../services/fix.service.js';

export const fixCode = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const result = await fixService.fixCode(projectId, req.user.id);
    return res.json({ success: true, data: result });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};
