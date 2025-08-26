// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('Error:', err.message);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message,
  });
};

module.exports = errorHandler;
