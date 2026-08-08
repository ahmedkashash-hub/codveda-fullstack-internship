import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from '../services/taskService.js';

export const create = async (request, response) => {
  const task = await createTask(request.auth.userId, request.body);
  response.status(201).json({ data: task });
};

export const list = async (request, response) => {
  const result = await listTasks(request.auth.userId, request.query);
  response.status(200).json(result);
};

export const getOne = async (request, response) => {
  const task = await getTask(request.auth.userId, request.params.id);
  response.status(200).json({ data: task });
};

export const update = async (request, response) => {
  const task = await updateTask(
    request.auth.userId,
    request.params.id,
    request.body,
  );
  response.status(200).json({ data: task });
};

export const remove = async (request, response) => {
  await deleteTask(request.auth.userId, request.params.id);
  response.status(204).send();
};
