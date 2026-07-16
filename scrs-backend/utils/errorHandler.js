// ─────────────────────────────────────────────────────────────────────────────
// utils/errorHandler.js — CUSTOM ERROR CLASS & ERROR MIDDLEWARE
//
// This file exports two things:
//   1. AppError  — a custom error class you can throw anywhere in the app
//   2. errorHandler — Express middleware that catches errors and returns JSON
// ─────────────────────────────────────────────────────────────────────────────


// ─── 1. AppError CLASS ────────────────────────────────────────────────────────
// AppError extends the built-in JavaScript Error class.
// 'extends' means it inherits all the features of Error, and we add our own.
//
// Why use a custom error class?
//   The default Error class only has a message.
//   We also need a statusCode (like 400, 401, 403, 404) for the HTTP response.
//
// Usage example:
//   throw new AppError('User not found', 404);
class AppError extends Error {
  constructor(message, statusCode) {
    // super(message) calls the parent Error class constructor.
    // This sets this.message to the message we passed in.
    super(message);

    // Store the HTTP status code (e.g. 400, 401, 404, 500)
    this.statusCode = statusCode || 500;

    // status is a human-readable label:
    //   4xx errors → 'fail'  (client made a mistake)
    //   5xx errors → 'error' (server made a mistake)
    this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'error';

    // isOperational = true means this is a "known" error we threw on purpose.
    // This helps distinguish our errors from unexpected programming bugs.
    this.isOperational = true;

    // Error.captureStackTrace records where the error was created.
    // This helps with debugging — you can see which line threw the error.
    Error.captureStackTrace(this, this.constructor);
  }
}


// ─── 2. errorHandler MIDDLEWARE ───────────────────────────────────────────────
// This is an Express error-handling middleware function.
// Express knows it's an error handler because it has 4 parameters.
// The first parameter 'err' is the error that was passed to next(err).
//
// This function runs whenever:
//   - You call next(err) from a controller or middleware
//   - An error is thrown inside an asyncHandler-wrapped function
//   - The 404 fallback in app.js creates and passes an AppError
//
// It sends a consistent JSON error response every time.
const errorHandler = (err, req, res, next) => {
  // Read statusCode from the error — or default to 500 (Internal Server Error)
  const statusCode = err.statusCode || 500;

  // Read the status label — or default to 'error'
  const status = err.status || 'error';

  // Send the JSON response back to the client
  // Example response: { "status": "fail", "message": "User not found" }
  res.status(statusCode).json({
    status,
    message: err.message || 'Internal Server Error',
  });
};


// Export both so other files can import them
module.exports = {
  errorHandler,
  AppError,
};