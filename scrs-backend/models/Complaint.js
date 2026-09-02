const mongoose = require('mongoose');
const { COMPLAINT_CATEGORY, COMPLAINT_STATUS, COMPLAINT_PRIORITY, DEFAULTS } = require('../utils/constants');

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Complaint must belong to a user'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: Object.values(COMPLAINT_CATEGORY),
    },
    status: {
      type: String,
      enum: Object.values(COMPLAINT_STATUS),
      default: DEFAULTS.DEFAULT_STATUS,
    },
    priority: {
      type: String,
      enum: Object.values(COMPLAINT_PRIORITY),
      default: DEFAULTS.DEFAULT_PRIORITY,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNote: {
      type: String,
      default: '',
    },
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
    attachments: [
      {
        filename: { type: String, required: true },
        filepath: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    rating: {
      score: { type: Number, min: 1, max: 5, default: null },
      feedback: { type: String, default: '' },
      ratedAt: { type: Date, default: null }
    },
    slaDeadline: {
      type: Date,
      default: null,
    },
    slaBreached: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
      default: null,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
