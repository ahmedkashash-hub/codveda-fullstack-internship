const errorHandler = (error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      message: 'Request body contains invalid JSON',
    });
  }

  console.error(error);
  return res.status(500).json({ message: 'Internal server error' });
};

module.exports = errorHandler;
