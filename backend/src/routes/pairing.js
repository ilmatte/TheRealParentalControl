const express = require('express');
const crypto = require('crypto');
const Pairing = require('../models/Pairing');
const Device = require('../models/Device');
const { authenticateToken, authParentOnly } = require('../middleware/auth');

const router = express.Router();

/**
 * Generate pairing token for a device
 * Called by Electron client when it starts
 */
router.post('/generate', async (req, res) => {
  try {
    const { device_id, device_name, device_os } = req.body;

    if (!device_id || !device_name || !device_os) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if device already has an active pairing
    const existingPairing = await Pairing.findOne({
      device_id,
      status: { $in: ['pending', 'paired'] },
    });

    if (existingPairing) {
      // Return existing pairing token and QR data
      return res.json({
        pairing_token: existingPairing.pairing_token,
        qr_code_data: existingPairing.qr_code_data,
        device_id: existingPairing.device_id,
      });
    }

    // Generate new pairing token
    const pairing_token = crypto.randomBytes(32).toString('hex');
    const qr_code_data = `${device_id}:${pairing_token}`;

    const pairing = new Pairing({
      device_id,
      device_name,
      device_os,
      pairing_token,
      qr_code_data,
      status: 'pending',
    });

    await pairing.save();

    res.json({
      pairing_token,
      qr_code_data,
      device_id,
      message: 'Pairing token generated. Scan QR code in parent app to pair.',
    });
  } catch (error) {
    console.error('Error generating pairing token:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Confirm pairing from parent app
 * Called by iPhone app after scanning QR code
 */
router.post('/confirm', authParentOnly, async (req, res) => {
  try {
    const { device_id, pairing_token, device_name } = req.body;

    if (!device_id || !pairing_token) {
      return res.status(400).json({ error: 'Missing device_id or pairing_token' });
    }

    // Find pending pairing
    const pairing = await Pairing.findOne({
      device_id,
      pairing_token,
      status: 'pending',
    });

    if (!pairing) {
      return res.status(404).json({ error: 'Pairing token not found or already used' });
    }

    // Update pairing
    pairing.parent_id = req.user.id;
    pairing.status = 'paired';
    pairing.paired_at = new Date();
    pairing.device_name = device_name || pairing.device_name;

    await pairing.save();

    // Create or update device association
    const device = await Device.findOneAndUpdate(
      { device_id },
      {
        user_id: req.user.id,
        device_name: device_name || pairing.device_name,
        last_sync: new Date(),
      },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Device paired successfully',
      device_id,
      device_name: pairing.device_name,
    });
  } catch (error) {
    console.error('Error confirming pairing:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get QR code data by device_id (for parent app to verify)
 * This validates the pairing before confirming
 */
router.get('/qr/:device_id', async (req, res) => {
  try {
    const { device_id } = req.params;

    const pairing = await Pairing.findOne({
      device_id,
      status: 'pending',
    });

    if (!pairing) {
      return res.status(404).json({ error: 'Device pairing not found or already paired' });
    }

    res.json({
      device_id: pairing.device_id,
      device_name: pairing.device_name,
      device_os: pairing.device_os,
      pairing_token: pairing.pairing_token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * List all paired devices for the parent
 */
router.get('/devices', authParentOnly, async (req, res) => {
  try {
    const pairingList = await Pairing.find({
      parent_id: req.user.id,
      status: 'paired',
    }).populate('parent_id', 'email username');

    res.json(pairingList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Verify device is owned by parent before allowing any operation
 * Middleware usage: authDeviceOwner(req, res) before operations
 */
router.get('/verify/:device_id', authParentOnly, async (req, res) => {
  try {
    const { device_id } = req.params;

    const pairing = await Pairing.findOne({
      device_id,
      parent_id: req.user.id,
      status: 'paired',
    });

    if (!pairing) {
      return res.status(403).json({ error: 'Device not paired with this account' });
    }

    res.json({
      verified: true,
      device_id: pairing.device_id,
      device_name: pairing.device_name,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Unpair device
 */
router.post('/unpair/:device_id', authParentOnly, async (req, res) => {
  try {
    const { device_id } = req.params;

    const pairing = await Pairing.findOneAndUpdate(
      {
        device_id,
        parent_id: req.user.id,
      },
      {
        status: 'unpaired',
      },
      { new: true }
    );

    if (!pairing) {
      return res.status(404).json({ error: 'Device pairing not found' });
    }

    res.json({ message: 'Device unpaired successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
