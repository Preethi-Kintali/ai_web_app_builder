import * as deployService from '../services/deploy.service.js';

export const deployProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const result = await deployService.deployProject(projectId, req.user.id);
    return res.json({ success: true, data: result });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const getDeployStatus = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const result = await deployService.getDeployStatus(projectId, req.user.id);
    return res.json({ success: true, data: result });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};
