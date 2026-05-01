const mongoose = require('mongoose');

const pairingSchema = new mongoose.Schema({
  device_id: {
    type: String,
    required: true,
    unique: true,
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pairing_token: {
    type: String,
    required: true,
    unique: true,
  },
  qr_code_data: {
    type: String,
    // Contains: device_id:pairing_token
  },
  status: {
    type: String,
    enum: ['pending', 'paired', 'unpaired'],
    default: 'pending',
  },
  paired_at: Date,
  last_connected: Date,
  
  // Device info
  device_name: String,
  device_os: String,
  
  // Encryption
  encryption_key: String, // For future secure communication
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Pairing', pairingSchema);
