import prisma from '../config/prisma.js';
import AppError from '../utils/AppError.js';

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const SORT_FIELDS = [
  'title',
  'status',
  'priority',
  'dueDate',
  'createdAt',
  'updatedAt',
];
const MUTABLE_FIELDS = ['title', 'description', 'status', 'priority', 'dueDate'];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

const requirePlainObject = (value, message) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AppError(message, 400);
  }
};

const validateId = (id) => {
  if (typeof id !== 'string' || !UUID_PATTERN.test(id)) {
    throw new AppError('Invalid task ID', 400);
  }

  return id;
};

const validateTitle = (title) => {
  const normalized = typeof title === 'string' ? title.trim() : '';

  if (normalized.length < 2 || normalized.length > 200) {
    throw new AppError('Title must be between 2 and 200 characters', 400);
  }

  return normalized;
};

const validateDescription = (description) => {
  if (description === null) return null;
  if (typeof description !== 'string') {
    throw new AppError('Description must be a string or null', 400);
  }

  const normalized = description.trim();
  if (normalized.length > 2000) {
    throw new AppError('Description must not exceed 2000 characters', 400);
  }

  return normalized;
};

const validateEnum = (value, allowed, field) => {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw new AppError(`Invalid ${field}`, 400);
  }

  return value;
};

const validateDueDate = (dueDate, allowNull) => {
  if (dueDate === null && allowNull) return null;
  if (
    typeof dueDate !== 'string' ||
    !ISO_DATE_PATTERN.test(dueDate) ||
    Number.isNaN(Date.parse(dueDate))
  ) {
    throw new AppError('dueDate must be a valid ISO date-time', 400);
  }

  return new Date(dueDate);
};

const rejectUnexpectedFields = (input) => {
  const unexpected = Object.keys(input).filter(
    (field) => !MUTABLE_FIELDS.includes(field),
  );

  if (unexpected.length > 0) {
    throw new AppError(`Field is not allowed: ${unexpected[0]}`, 400);
  }
};

const buildTaskData = (input, partial = false) => {
  requirePlainObject(input, 'A JSON task body is required');
  rejectUnexpectedFields(input);

  if (partial && Object.keys(input).length === 0) {
    throw new AppError('At least one task field is required', 400);
  }

  const data = {};
  if (!partial || Object.hasOwn(input, 'title')) data.title = validateTitle(input.title);
  if (Object.hasOwn(input, 'description')) {
    data.description = validateDescription(input.description);
  }
  if (Object.hasOwn(input, 'status')) {
    data.status = validateEnum(input.status, TASK_STATUSES, 'status');
  }
  if (Object.hasOwn(input, 'priority')) {
    data.priority = validateEnum(input.priority, TASK_PRIORITIES, 'priority');
  }
  if (Object.hasOwn(input, 'dueDate')) {
    data.dueDate = validateDueDate(input.dueDate, partial);
  }

  return data;
};

const parsePositiveInteger = (value, fallback, field, maximum) => {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new AppError(`${field} must be a positive integer`, 400);
  }

  const parsed = Number(value);
  if (parsed < 1 || parsed > maximum) {
    throw new AppError(`${field} must be between 1 and ${maximum}`, 400);
  }

  return parsed;
};

const buildListOptions = (query) => {
  requirePlainObject(query, 'Invalid query parameters');
  const allowedQueryFields = [
    'page', 'limit', 'status', 'priority', 'search', 'sortBy', 'sortOrder',
  ];
  const unexpected = Object.keys(query).find(
    (field) => !allowedQueryFields.includes(field),
  );
  if (unexpected) throw new AppError(`Invalid query parameter: ${unexpected}`, 400);

  const page = parsePositiveInteger(query.page, 1, 'page', 1_000_000);
  const limit = parsePositiveInteger(query.limit, 10, 'limit', 100);
  const sortBy = query.sortBy ?? 'createdAt';
  const sortOrder = query.sortOrder ?? 'desc';

  if (typeof sortBy !== 'string' || !SORT_FIELDS.includes(sortBy)) {
    throw new AppError('Invalid sortBy', 400);
  }
  if (!['asc', 'desc'].includes(sortOrder)) {
    throw new AppError('Invalid sortOrder', 400);
  }

  const where = {};
  if (query.status !== undefined) {
    where.status = validateEnum(query.status, TASK_STATUSES, 'status');
  }
  if (query.priority !== undefined) {
    where.priority = validateEnum(query.priority, TASK_PRIORITIES, 'priority');
  }
  if (query.search !== undefined) {
    if (typeof query.search !== 'string') throw new AppError('Invalid search', 400);
    const search = query.search.trim();
    if (!search || search.length > 200) {
      throw new AppError('Search must be between 1 and 200 characters', 400);
    }
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  return { page, limit, sortBy, sortOrder, where };
};

const throwNotFound = () => {
  throw new AppError('Task not found', 404);
};

export const createTask = async (userId, input) => {
  const data = buildTaskData(input);
  return prisma.task.create({ data: { ...data, ownerId: userId } });
};

export const listTasks = async (userId, query) => {
  const options = buildListOptions(query);
  const where = { ownerId: userId, ...options.where };
  const [data, totalItems] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      orderBy: { [options.sortBy]: options.sortOrder },
    }),
    prisma.task.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page: options.page,
      limit: options.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / options.limit),
    },
  };
};

export const getTask = async (userId, id) => {
  validateId(id);
  const task = await prisma.task.findFirst({ where: { id, ownerId: userId } });
  return task ?? throwNotFound();
};

export const updateTask = async (userId, id, input) => {
  validateId(id);
  const data = buildTaskData(input, true);
  const result = await prisma.task.updateMany({
    where: { id, ownerId: userId },
    data,
  });
  if (result.count === 0) throwNotFound();

  const task = await prisma.task.findFirst({ where: { id, ownerId: userId } });
  return task ?? throwNotFound();
};

export const deleteTask = async (userId, id) => {
  validateId(id);
  const result = await prisma.task.deleteMany({ where: { id, ownerId: userId } });
  if (result.count === 0) throwNotFound();
};
