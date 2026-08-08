import apiClient from './apiClient.js';

export const getTasks = async (params, signal) => {
  const response = await apiClient.get('/tasks', { params, signal });
  return response.data;
};

export const getTaskById = async (id) => {
  const response = await apiClient.get(`/tasks/${id}`);
  return response.data.data;
};

export const createTask = async (payload) => {
  const response = await apiClient.post('/tasks', payload);
  return response.data.data;
};

export const updateTask = async (id, payload) => {
  const response = await apiClient.patch(`/tasks/${id}`, payload);
  return response.data.data;
};

export const deleteTask = async (id) => {
  await apiClient.delete(`/tasks/${id}`);
};
