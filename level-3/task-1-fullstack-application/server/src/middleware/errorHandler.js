import AppError from '../utils/AppError.js';

const errorHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({ message: error.message });
  }

  if (error?.type === 'entity.parse.failed') {
    return response.status(400).json({ message: 'Invalid JSON body' });
  }

  if (error?.type === 'entity.too.large') {
    return response.status(413).json({ message: 'Request body is too large' });
  }

  return response.status(500).json({ message: 'Internal server error' });
};

export default errorHandler;
