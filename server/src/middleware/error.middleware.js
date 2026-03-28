export const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose ValidationErrors with more detail
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const paths = Object.keys(err.errors).join(', ');
    message = `Validation failed at: ${paths}. Details: ${message}`;
  }

  console.error(`[Error] ${statusCode} - ${message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      validationErrors: err.errors ? Object.keys(err.errors) : null 
    }),
  });
};
