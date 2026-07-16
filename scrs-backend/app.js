// ─────────────────────────────────────────────────────────────────────────────
// app.js — THE EXPRESS APPLICATION
// This file creates and configures the Express app.
// It does NOT start the server — that is server.js's job.
// Think of app.js as: "set up the kitchen", server.js as: "open the restaurant".
// ─────────────────────────────────────────────────────────────────────────────

// Import Express — the web framework we are building our API with
const express = require('express');
const rateLimit = require('express-rate-limit');

// Import our custom error utilities
const { errorHandler, AppError } = require('./utils/errorHandler');

// Import route files
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');

// ─── CREATE THE APP ───────────────────────────────────────────────────────────
// express() creates the application. We store it in a variable called 'app'.
// Everything below adds features to this app object.
const app = express();
const cors = require('cors');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    status: 'error',
    message: 'Too many authentication attempts. Please try again later.',
  },
});

// Enable CORS for the frontend URL
// In development: http://localhost:3000
// In production: set FRONTEND_URL in .env
const allowedOrigins = [
  'http://localhost:3000',      // development
  'http://127.0.0.1:3000',      // alternative localhost
  process.env.FRONTEND_URL,     // production URL from .env
].filter(Boolean); // remove undefined values

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ─── MIDDLEWARE: Parse incoming JSON bodies ───────────────────────────────────
// When a client (like Postman or React) sends data in the request body,
// it sends it as JSON text. express.json() reads that text and converts it
// into a JavaScript object available as req.body.
// Without this line, req.body will be undefined in all your controllers.
app.use(express.json());

// ─── STATIC FOLDER FOR UPLOADS ────────────────────────────────────────────────
// This allows the frontend to access uploaded files via a URL like:
// http://localhost:5000/uploads/filename.jpg
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── MOUNT ROUTES ─────────────────────────────────────────────────────────────
// Apply rate limiting to authentication endpoints before route handling.
app.use('/api/auth', authLimiter);

// app.use('/api/auth', authRoutes) means:
//   Any URL that starts with /api/auth → send it to authRoutes to handle.
//
// app.use('/api/complaints', complaintRoutes) means:
//   Any URL that starts with /api/complaints → send it to complaintRoutes.
//
// This keeps the code clean — app.js doesn't need to know every single URL.
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// Mount admin routes at /api/admin
// Any URL starting with /api/admin → handled by adminRoutes
// All routes inside adminRoutes.js are already protected by protect + authorize('admin')
app.use('/api/admin', adminRoutes);

// ─── ROOT ROUTE ───────────────────────────────────────────────────────────────
// GET http://localhost:5000/
// This is just a health-check route to confirm the server is running.
// Useful to quickly test: "is my server alive?"
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// ─── 404 FALLBACK ─────────────────────────────────────────────────────────────
// If a request comes in and NO route above matched it, we end up here.
// We create an AppError (our custom error class) with a 404 status code.
// next(err) passes the error to the error handler middleware below.
// req.method → e.g. "GET", "POST"
// req.originalUrl → e.g. "/api/unknown"
app.use((req, res, next) => {
  const err = new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404);
  next(err);
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
// This is the last middleware in the chain.
// Any error that reaches next(err) anywhere in the app lands here.
// It always returns JSON — never HTML — which is what APIs should do.
// IMPORTANT: Error handler middleware must have exactly 4 parameters.
//            Express identifies it by the 4th parameter (next).
app.use(errorHandler);

// Export the app so server.js can call app.listen() on it
module.exports = app;
