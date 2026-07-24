// ─────────────────────────────────────────────────────────────────────────────
// models/Complaint.js — COMPLAINT SCHEMA (DATABASE SHAPE)
//
// This file defines what a "complaint" document looks like in MongoDB.
// Every complaint filed by a user will be stored with exactly these fields.
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

// Import system constants
const { COMPLAINT_CATEGORY, COMPLAINT_STATUS, COMPLAINT_PRIORITY, DEFAULTS } = require('../utils/constants');

// ─── DEFINE THE SCHEMA ────────────────────────────────────────────────────────
const complaintSchema = new mongoose.Schema(
  {
    // ── user ──────────────────────────────────────────────────────────────────
    // Who filed this complaint?
    // We store the user's MongoDB ID (ObjectId), not the full user object.
    // This is how MongoDB links documents across collections (like a foreign key in SQL).
    //
    // ref: 'User' enables .populate('user') — Mongoose will replace this ID
    // with the actual User document when you call populate().
    user: {
      type: mongoose.Schema.Types.ObjectId, // stores a MongoDB ID
      ref: 'User',                          // links to the User collection
      required: [true, 'Complaint must belong to a user'],
    },

    // ── title ─────────────────────────────────────────────────────────────────
    // A short one-line summary of the complaint.
    // trim: true removes any accidental leading/trailing spaces before saving.
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },

    // ── description ───────────────────────────────────────────────────────────
    // Full details about the problem.
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
    },

    // ── category ──────────────────────────────────────────────────────────────
    // What type of complaint is this?
    // enum means only these exact values are accepted — anything else fails validation.
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: Object.values(COMPLAINT_CATEGORY), // ['academic', 'hostel', 'infrastructure', 'other']
    },

    // ── status ────────────────────────────────────────────────────────────────
    // Tracks where the complaint is in the resolution process.
    // default: COMPLAINT_STATUS.OPEN means every new complaint starts as 'Open'.
    // Only agents and admins can change this field.
    status: {
      type: String,
      enum: Object.values(COMPLAINT_STATUS), // ['Open', 'In Progress', 'Resolved', 'Closed']
      default: DEFAULTS.DEFAULT_STATUS,
    },

    // ── priority ──────────────────────────────────────────────────────────────
    // How urgent is this complaint?
    // Users can set this when submitting. Agents can also update it.
    priority: {
      type: String,
      enum: Object.values(COMPLAINT_PRIORITY), // ['low', 'medium', 'high', 'critical']
      default: DEFAULTS.DEFAULT_PRIORITY,
    },

    // ── assignedTo ────────────────────────────────────────────────────────────
    // Which agent is handling this complaint?
    // default: null means "unassigned" when the complaint is first created.
    // Only admins can assign a complaint to an agent.
    // ref: 'User' lets us populate this with the agent's name and email.
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = unassigned
    },

    // ── resolutionNote ────────────────────────────────────────────────────────
    resolutionNote: {
      type: String,
      default: '',
    },

    // ── history ───────────────────────────────────────────────────────────────
    // Tracks every action performed on this complaint (timeline)
    history: [
      {
        action: { type: String, required: true },
        prevValue: { type: String },
        newValue: { type: String },
        performedBy: { type: String, required: true },
        role: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ],

    // ── attachments ───────────────────────────────────────────────────────────
    // Files uploaded by the user when creating the complaint
    attachments: [
      {
        filename: { type: String, required: true },
        filepath: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],

    // ── comments ──────────────────────────────────────────────────────────────
    // Discussion thread between User, Agent, and Admin
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        text: {
          type: String,
          required: true,
          trim: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    // ── rating ────────────────────────────────────────────────────────────────
    // User feedback and rating after complaint is resolved or closed
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
        default: null
      },
      feedback: {
        type: String,
        default: ''
      },
      ratedAt: {
        type: Date,
        default: null
      }
    }
  },

  // ─── SCHEMA OPTIONS ─────────────────────────────────────────────────────────
  // timestamps: true tells Mongoose to automatically add two fields:
  //   createdAt — set to the current date/time when the document is created
  //   updatedAt — updated automatically every time the document is saved
  // This is cleaner than manually adding these fields to the schema above.
  {
    timestamps: true,
  }
);

// Create and export the Complaint model
// Mongoose will store documents in a collection called 'complaints' (auto-pluralised)
module.exports = mongoose.model('Complaint', complaintSchema);
