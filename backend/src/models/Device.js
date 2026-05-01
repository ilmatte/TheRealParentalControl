const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  device_id: {
    type: String,
    unique: true,
    required: true,
  },
  device_name: String,
  os: {
    type: String,
    enum: ['windows', 'macos', 'linux'],
    required: true,
  },
  os_version: String,
  chrome_version: String,
  // Multi-user support for Windows
  windows_users: [
    {
      username: {
        type: String,
        required: true,
      },
      display_name: String,
      sid: String, // Windows Security Identifier
      is_child: {
        type: Boolean,
        default: false,
      },
      _id: false,
    },
  ],
  is_active: {
    type: Boolean,
    default: true,
  },
  last_sync: Date,
  ip_address: String,
  location: {
    latitude: Number,
    longitude: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Device', deviceSchema);
