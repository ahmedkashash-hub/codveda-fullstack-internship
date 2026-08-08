import { useCallback, useEffect, useState } from 'react';
import * as taskService from '../services/taskService.js';
import getApiErrorMessage from '../utils/getApiErrorMessage.js';

const EMPTY_PAGINATION = {
  page: 1,
  limit: 6,
  totalItems: 0,
  totalPages: 0,
};

export default function useTasks(params, onUnauthorized) {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const handleError = useCallback((requestError) => {
    if (requestError?.response?.status === 401) {
      onUnauthorized();
      return;
    }
    setError(getApiErrorMessage(requestError));
  }, [onUnauthorized]);

  const fetchTasks = useCallback(async (signal) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await taskService.getTasks(params, signal);
      if (signal?.aborted) return;
      setTasks(result.data);
      setPagination(result.pagination);
    } catch (requestError) {
      if (signal?.aborted) return;
      handleError(requestError);
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [handleError, params]);

  useEffect(() => {
    const controller = new AbortController();
    fetchTasks(controller.signal);
    return () => controller.abort();
  }, [fetchTasks]);

  const addTask = async (payload, refresh = true) => {
    try {
      const task = await taskService.createTask(payload);
      if (refresh) await fetchTasks();
      return task;
    } catch (requestError) {
      handleError(requestError);
      throw requestError;
    }
  };

  const editTask = async (id, payload) => {
    try {
      const task = await taskService.updateTask(id, payload);
      await fetchTasks();
      return task;
    } catch (requestError) {
      handleError(requestError);
      throw requestError;
    }
  };

  const removeTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      const shouldUsePreviousPage = tasks.length === 1 && pagination.page > 1;
      if (!shouldUsePreviousPage) await fetchTasks();
      return shouldUsePreviousPage;
    } catch (requestError) {
      handleError(requestError);
      throw requestError;
    }
  };

  return {
    tasks,
    pagination,
    isLoading,
    error,
    refreshTasks: fetchTasks,
    addTask,
    editTask,
    removeTask,
  };
}
