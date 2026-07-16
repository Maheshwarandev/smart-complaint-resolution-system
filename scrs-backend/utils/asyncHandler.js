// ─────────────────────────────────────────────────────────────────────────────
// utils/asyncHandler.js — ASYNC ERROR WRAPPER
//
// PROBLEM this file solves:
//   Our controller functions are async (they use await).
//   If an async function throws an error, Express does NOT catch it
//   automatically — the app just hangs or crashes.
//
// SOLUTION:
//   Wrap every async controller with asyncHandler.
//   asyncHandler runs the function and catches any error that is thrown.
//   It then passes the error to Express's error handler using next(err).
//
// USAGE in route files:
//   router.get('/', asyncHandler(getAllComplaints));
//   Now if getAllComplaints throws an error, it goes to the error handler.
// ─────────────────────────────────────────────────────────────────────────────

// asyncHandler takes a function (fn) as input and returns a NEW function.
// The new function:
//   1. Calls the original async function with (req, res, next)
//   2. Wraps it in Promise.resolve() to make sure it's treated as a Promise
//   3. Uses .catch(next) to send any error to Express's error handler
//
// Think of it as a safety net around every async route handler.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Export so route files can use it
module.exports = asyncHandler;
