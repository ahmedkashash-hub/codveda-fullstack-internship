import {
  authenticateUser,
  getUserById,
  registerUser,
} from '../services/authService.js';

export const register = async (request, response) => {
  const user = await registerUser(request.body);

  response.status(201).json({
    message: 'User registered successfully',
    user,
  });
};

export const login = async (request, response) => {
  const result = await authenticateUser(request.body);

  response.status(200).json({
    message: 'Login successful',
    ...result,
  });
};

export const getCurrentUser = async (request, response) => {
  const user = await getUserById(request.auth.userId);

  response.status(200).json({ user });
};
