const mongoose = require('mongoose');

const restrictionSchema = new mongoose.Schema({
  child_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  device_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  blocked_websites: {
    type: [String],
    default: [],
  },
  allowed_websites: {
    type: [String],
    default: [],
  },
  blocked_apps: {
    type: [String],
    default: ['chrome'],
  },
  daily_time_limit: {
    type: Number,
    default: 120, // in minutes
  },
  usage_schedule: {
    monday: { start: '08:00', end: '22:00' },
    tuesday: { start: '08:00', end: '22:00' },
    wednesday: { start: '08:00', end: '22:00' },
    thursday: { start: '08:00', end: '22:00' },
    friday: { start: '08:00', end: '23:00' },
    saturday: { start: '09:00', end: '23:00' },
    sunday: { start: '09:00', end: '22:00' },
  },
  screen_lock: {
    enabled: { type: Boolean, default: false },
    locked_at: Date,
    reason: String,
  },
  safe_search_enabled: { type: Boolean, default: true },
  youtube_restricted_mode: { type: Boolean, default: true },
  is_active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Restriction', restrictionSchema);
