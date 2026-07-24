// ─────────────────────────────────────────────────────────────────────────────
// config/db.js — DATABASE CONNECTION
// This file handles the MongoDB connection using Mongoose.
// Mongoose is a library that lets you interact with MongoDB using JavaScript.
// ─────────────────────────────────────────────────────────────────────────────

// Import mongoose — the library that connects Node.js to MongoDB
const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows DNS resolution issues with mongodb+srv SRV lookup
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  // Ignore if custom DNS server set fails
}

// ─── connectDB FUNCTION ───────────────────────────────────────────────────────
// This is an async function because connecting to a database takes time.
// 'async' means: "this function will wait for things to finish before moving on".
// We export it so server.js can call it at startup.
const connectDB = async () => {
  try {
    // mongoose.connect() opens a connection to the MongoDB database.
    // process.env.MONGO_URI reads the database URL from your .env file.
    // Example MONGO_URI: mongodb://127.0.0.1:27017/scrs_db
    // 'await' means: "wait here until the connection is established".
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // If connection succeeded, log the host name to the terminal.
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed a default administrator if none exists
    const User = require('../models/User');
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('No admin user found. Auto-seeding default system administrator...');
      await User.create({
        name: 'System Administrator',
        email: 'admin@scrs.com',
        password: 'adminpassword123',
        role: 'admin'
      });
      console.log('Default administrator account (admin@scrs.com) created!');
    }

  } catch (error) {
    // If something goes wrong (wrong URI, MongoDB not running, etc.),
    // we log the error message to the terminal.
    console.error(`MongoDB Connection Failed: ${error.message}`);

    // process.exit(1) stops the Node.js process completely.
    // We exit because the app cannot work at all without a database.
    // The '1' means "exit with an error" (0 = success, 1 = failure).
    process.exit(1);
  }
};

// Make this function available to other files (specifically server.js)
module.exports = connectDB;