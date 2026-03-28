import Project from '../models/Project.model.js';
import { bundleFilesToHtml, mapToObject } from '../utils/code.utils.js';

// ──────────────────────────────────────────────
// STABILITY: Normalize Project Data for UI (Helper)
// ──────────────────────────────────────────────
export const normalizeProject = (project) => {
  if (!project) return null;

  const p = project.toObject?.() || project;

  // Ensure top-level files is an object, not a Map
  p.files = mapToObject(p.files);

  // Normalize versions
  if (p.versions && Array.isArray(p.versions)) {
    p.versions = p.versions.map((v) => {
      const vFiles = mapToObject(v.files);
      // Legacy support: if files is empty but code exists, map it to index.html
      const finalFiles = (Object.keys(vFiles).length === 0 && v.code) 
        ? { 'index.html': v.code } 
        : vFiles;

      return {
        ...v,
        files: finalFiles
      };
    });
  }

  return p;
};

export const getUserProjects = async (userId) => {
  const projects = await Project.find({ userId }).sort({ updatedAt: -1 });
  return projects;
};

export const getProjectById = async (projectId, userId) => {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }
  return project;
};

export const createProject = async (userId, title = 'Untitled Project') => {
  const project = await Project.create({ userId, title });
  return project;
};

export const updateProject = async (projectId, userId, updates) => {
  const project = await Project.findOneAndUpdate(
    { _id: projectId, userId },
    { ...updates },
    { new: true, runValidators: true }
  );
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }
  return project;
};

export const deleteProject = async (projectId, userId) => {
  const project = await Project.findOneAndDelete({ _id: projectId, userId });
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }
  return project;
};

// ──────────────────────────────────────────────
// Feature 10: Enhanced Version Control
// ──────────────────────────────────────────────
export const getProjectVersions = async (projectId, userId) => {
  const project = await getProjectById(projectId, userId);

  const versionsWithIndex = project.versions.map((v, i) => {
    const filesObj = mapToObject(v.files); 
    const finalFiles = (Object.keys(filesObj).length === 0 && v.code) 
      ? { 'index.html': v.code } 
      : filesObj;

    const fileCount = Object.keys(finalFiles).length;
    const previewCode = v.code || (finalFiles['index.html'] || '');

    return {
      index: i,
      createdAt: v.createdAt,
      changeDescription: v.changeDescription || 'Code updated',
      promptSnapshot: v.promptSnapshot || '',
      fileCount,
      preview: previewCode.substring(0, 150) + (previewCode.length > 150 ? '...' : ''),
      files: finalFiles,
    };
  }).reverse();

  return { versions: versionsWithIndex, total: project.versions.length };
};

export const restoreVersion = async (projectId, userId, versionIndex) => {
  const projectDoc = await Project.findOne({ _id: projectId, userId });
  if (!projectDoc) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  const idx = parseInt(versionIndex, 10);
  if (idx < 0 || idx >= projectDoc.versions.length) {
    const error = new Error('Version not found.');
    error.statusCode = 404;
    throw error;
  }

  const targetVersion = projectDoc.versions[idx];

  // Archive current code before restoring
  const currentFiles = mapToObject(projectDoc.files);
  if (projectDoc.generatedCode || Object.keys(currentFiles).length > 0) {
    projectDoc.versions.push({
      code: projectDoc.generatedCode || '',
      files: currentFiles,
      changeDescription: 'State saved before restore',
      promptSnapshot: 'restore:pre',
    });
  }

  // Restore files from version
  const targetFiles = mapToObject(targetVersion.files);
  if (Object.keys(targetFiles).length > 0) {
    projectDoc.files = targetFiles;
    projectDoc.generatedCode = bundleFilesToHtml(targetFiles);
  } else if (targetVersion.code) {
    projectDoc.generatedCode = targetVersion.code;
    projectDoc.files = {};
  }

  const restoreDate = new Date(targetVersion.createdAt).toLocaleString();
  projectDoc.messages.push({
    role: 'assistant',
    content: `⏪ Restored version from ${restoreDate}: "${targetVersion.changeDescription}"`,
  });

  await projectDoc.save();

  return projectDoc;
};

export const toggleShare = async (projectId, userId) => {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }
  project.isPublic = !project.isPublic;
  await project.save();
  return { isPublic: project.isPublic };
};
