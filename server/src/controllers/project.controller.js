import * as projectService from '../services/project.service.js';
import { normalizeProject } from '../services/project.service.js';

export const getProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getUserProjects(req.user.id);
    const data = projects.map(normalizeProject);
    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { title } = req.body;
    const project = await projectService.createProject(req.user.id, title);
    return res.status(201).json({ success: true, data: normalizeProject(project) });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user.id);
    return res.json({ success: true, data: normalizeProject(project) });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { title } = req.body;
    const project = await projectService.updateProject(req.params.id, req.user.id, { title });
    return res.json({ success: true, data: normalizeProject(project) });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id, req.user.id);
    return res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const getVersions = async (req, res, next) => {
  try {
    const result = await projectService.getProjectVersions(req.params.id, req.user.id);
    return res.json({ success: true, data: result });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const restoreVersion = async (req, res, next) => {
  try {
    const project = await projectService.restoreVersion(req.params.id, req.user.id, req.params.versionIndex);
    return res.json({ success: true, data: normalizeProject(project) });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const toggleShare = async (req, res, next) => {
  try {
    const result = await projectService.toggleShare(req.params.id, req.user.id);
    return res.json({ success: true, data: result });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

