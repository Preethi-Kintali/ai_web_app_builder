import * as explainService from '../services/explain.service.js';

export const explainCode = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const explanation = await explainService.explainCode(projectId, req.user.id);
    return res.json({ success: true, data: { explanation } });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};
