const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
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
  activity_type: {
    type: String,
    enum: ['website_visit', 'app_open', 'screen_time', 'restriction_triggered'],
    required: true,
  },
  details: {
    url: String,
    title: String,
    app_name: String,
    duration: Number, // in seconds
    blocked: Boolean,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 2592000, // Auto-delete after 30 days
  },
});

module.exports = mongoose.model('Activity', activitySchema);
