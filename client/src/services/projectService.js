import api from './api.js';

const getProjects = async () => {
  const response = await api.get('/projects');
  return response.data.data;
};

const getProject = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data.data;
};

const createProject = async (title) => {
  const response = await api.post('/projects', { title });
  return response.data.data;
};

const updateProject = async (id, updates) => {
  const response = await api.put(`/projects/${id}`, updates);
  return response.data.data;
};

const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};

export { getProjects, getProject, createProject, updateProject, deleteProject };
