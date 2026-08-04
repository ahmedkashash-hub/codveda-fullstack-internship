const errorHandler = (error, req, res, next) => {
  console.error(error);

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      message: 'Request body contains invalid JSON',
    });
  }

  return res.status(500).json({ message: 'Internal server error' });
};

module.exports = errorHandler;
