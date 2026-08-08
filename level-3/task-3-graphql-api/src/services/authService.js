import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import {
  badUserInput,
  conflict,
  databaseReadError,
  databaseWriteError,
  unauthenticated,
} from '../utils/graphqlErrors.js';

const BCRYPT_ROUNDS = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeUser = (user) =>
  user && {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };

const normalizeEmail = (value) => {
  if (typeof value !== 'string') throw badUserInput('email must be a string.');
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    throw badUserInput('email must be a valid email address.');
  }
  return email;
};

const validateName = (value) => {
  if (typeof value !== 'string') throw badUserInput('name must be a string.');
  const name = value.trim();
  if (name.length < 2 || name.length > 100) {
    throw badUserInput('name must contain between 2 and 100 characters.');
  }
  return name;
};

const validatePassword = (value) => {
  if (typeof value !== 'string' || value.length < 8) {
    throw badUserInput('password must contain at least 8 characters.');
  }
  if (value.length > 128) throw badUserInput('password cannot exceed 128 characters.');
  return value;
};

const getJwtConfig = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  if (!process.env.JWT_EXPIRES_IN) throw new Error('JWT_EXPIRES_IN is required');
  return { secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_EXPIRES_IN };
};

const issueToken = (user) => {
  const { secret, expiresIn } = getJwtConfig();
  return jwt.sign({ role: user.role }, secret, {
    algorithm: 'HS256',
    subject: user.id,
    expiresIn,
  });
};

export const registerUser = async (input) => {
  const name = validateName(input.name);
  const email = normalizeEmail(input.email);
  const password = validatePassword(input.password);
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    return normalizeUser(
      await prisma.user.create({
        data: { name, email, passwordHash, role: 'USER' },
      }),
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw conflict('An account with this email already exists.');
    }
    throw databaseWriteError();
  }
};

export const loginUser = async (input) => {
  const email = normalizeEmail(input.email);
  if (typeof input.password !== 'string') throw badUserInput('password must be a string.');

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch {
    throw databaseReadError();
  }

  const passwordMatches = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
  if (!user || !passwordMatches) throw unauthenticated('Invalid email or password.');

  try {
    return { user: normalizeUser(user), token: issueToken(user) };
  } catch {
    throw databaseWriteError();
  }
};

export const getUserById = async (id) => {
  try {
    return normalizeUser(await prisma.user.findUnique({ where: { id } }));
  } catch {
    throw databaseReadError();
  }
};
