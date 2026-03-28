import api from './api';

// ── Code Explain ──────────────────────────────────────────────
export const explainCodeAPI = async (projectId) => {
  const response = await api.post(`/explain/${projectId}`);
  return response.data.data.explanation;
};

// ── Auto Fix ─────────────────────────────────────────────────
export const fixCodeAPI = async (projectId) => {
  const response = await api.post(`/fix/${projectId}`);
  return response.data.data;
};

// ── Public project ────────────────────────────────────────────
export const getPublicProjectAPI = async (projectId) => {
  const response = await api.get(`/public/${projectId}`);
  return response.data.data;
};

// ── Version history ───────────────────────────────────────────
export const getProjectVersionsAPI = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/versions`);
  return response.data.data;
};

export const restoreVersionAPI = async (projectId, versionIndex) => {
  const response = await api.post(`/projects/${projectId}/restore/${versionIndex}`);
  return response.data.data;
};

// ── Share / Publish ───────────────────────────────────────────
export const toggleShareAPI = async (projectId) => {
  const response = await api.patch(`/projects/${projectId}/share`);
  return response.data.data;
};

// ── Refactor (Feature 2) ──────────────────────────────────────
/**
 * @param {string} projectId
 * @param {'optimize'|'make-responsive'|'convert-to-react'|'improve-ui'|'add-dark-mode'|'improve-accessibility'} action
 */
export const refactorCodeAPI = async (projectId, action) => {
  const response = await api.post(`/refactor/${projectId}`, { action });
  return response.data.data;
};

// ── Deploy (Feature 4) ────────────────────────────────────────
export const deployProjectAPI = async (projectId) => {
  const response = await api.post(`/deploy/${projectId}`);
  return response.data.data;
};

export const getDeployStatusAPI = async (projectId) => {
  const response = await api.get(`/deploy/${projectId}/status`);
  return response.data.data;
};

// ── Preferences (Feature 7) ───────────────────────────────────
export const getPreferencesAPI = async () => {
  const response = await api.get('/preferences');
  return response.data.data;
};

export const updatePreferencesAPI = async (updates) => {
  const response = await api.put('/preferences', updates);
  return response.data.data;
};

