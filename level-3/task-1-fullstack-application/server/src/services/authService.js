import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import AppError from '../utils/AppError.js';

const SALT_ROUNDS = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAFE_USER_FIELDS = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

const normalizeEmail = (email) =>
  typeof email === 'string' ? email.trim().toLowerCase() : '';

const validateEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!EMAIL_PATTERN.test(normalizedEmail) || normalizedEmail.length > 254) {
    throw new AppError('A valid email is required', 400);
  }

  return normalizedEmail;
};

const validatePassword = (password) => {
  if (typeof password !== 'string' || password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw new AppError('Password must not exceed 72 bytes', 400);
  }
};

const validateRegistration = ({ name, email, password } = {}) => {
  const normalizedName = typeof name === 'string' ? name.trim() : '';

  if (normalizedName.length < 2 || normalizedName.length > 100) {
    throw new AppError('Name must be between 2 and 100 characters', 400);
  }

  const normalizedEmail = validateEmail(email);
  validatePassword(password);

  return { name: normalizedName, email: normalizedEmail, password };
};

const getJwtConfiguration = () => {
  if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
    throw new AppError('Authentication is not configured', 500);
  }

  return {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  };
};

export const registerUser = async (input) => {
  const data = validateRegistration(input);
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  try {
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: 'USER',
      },
      select: SAFE_USER_FIELDS,
    });
  } catch (error) {
    if (error?.code === 'P2002') {
      throw new AppError('An account with this email already exists', 409);
    }

    throw error;
  }
};

export const authenticateUser = async ({ email, password } = {}) => {
  const normalizedEmail = validateEmail(email);

  if (typeof password !== 'string' || password.length === 0) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  const passwordMatches = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!user || !passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  const jwtConfiguration = getJwtConfiguration();
  const token = jwt.sign(
    { role: user.role },
    jwtConfiguration.secret,
    {
      subject: user.id,
      expiresIn: jwtConfiguration.expiresIn,
      algorithm: 'HS256',
    },
  );

  const { passwordHash: _passwordHash, ...safeUser } = user;

  return { user: safeUser, token };
};

export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: SAFE_USER_FIELDS,
  });

  if (!user) {
    throw new AppError('Authentication required', 401);
  }

  return user;
};
