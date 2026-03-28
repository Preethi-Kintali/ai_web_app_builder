import Project from '../models/Project.model.js';

export const getPublicProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({ _id: id, isPublic: true }).select('title generatedCode');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found or not public.' });
    }
    return res.json({ success: true, data: { title: project.title, generatedCode: project.generatedCode } });
  } catch (error) {
    next(error);
  }
};
