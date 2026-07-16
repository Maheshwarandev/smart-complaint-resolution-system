// ─────────────────────────────────────────────────────────────────────────────
// server.js — THE ENTRY POINT
// This is the first file Node runs when you type `npm run dev`.
// Its only job is: load settings → connect to database → start the server.
// ─────────────────────────────────────────────────────────────────────────────

// ─── STEP 1: Load environment variables from .env ────────────────────────────
// The .env file stores secret values like PORT, MONGO_URI, JWT_SECRET.
// dotenv reads that file and makes those values available in process.env.
// This MUST be the very first line — other files will need these values
// as soon as they are imported below.
require("dotenv").config();

// ─── STEP 2: Import the database connection function ─────────────────────────
// We wrote this function in config/db.js.
// Calling connectDB() will open a connection to MongoDB.
const connectDB = require("./config/db");

// ─── STEP 3: Import the Express application ───────────────────────────────────
// app.js builds the Express app (routes, middleware, error handling).
// We import it here so we can tell it to start listening for requests.
const app = require("./app");

// ─── STEP 4: Connect to MongoDB ───────────────────────────────────────────────
// We connect to the database before starting the server.
// This way the database is ready when the first request arrives.
connectDB();

// ─── STEP 5: Read the port number ────────────────────────────────────────────
// process.env.PORT reads the PORT value from .env.
// If PORT is not set in .env, we use 5000 as the default.
// The || (OR) operator means: "use this if the left side is undefined/empty".
const PORT = process.env.PORT || 5000;

// ─── STEP 6: Start the server ─────────────────────────────────────────────────
// app.listen() tells Node to start accepting HTTP requests on the chosen port.
// The arrow function runs once — only when the server successfully starts.
// After this line, your API is live at http://localhost:5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
