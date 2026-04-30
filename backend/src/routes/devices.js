const express = require('express');
const Device = require('../models/Device');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register device
router.post('/register', authenticateToken, async (req, res) => {
  try {
    const { device_id, device_name, os, os_version, chrome_version } = req.body;

    const existingDevice = await Device.findOne({ device_id });
    if (existingDevice) {
      return res.status(400).json({ error: 'Device already registered' });
    }

    const device = new Device({
      user_id: req.user.id,
      device_id,
      device_name,
      os,
      os_version,
      chrome_version,
      last_sync: new Date(),
    });

    await device.save();
    res.json({ message: 'Device registered successfully', device });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user devices
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const devices = await Device.find({ user_id: req.user.id });
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update device status
router.put('/:device_id/sync', authenticateToken, async (req, res) => {
  try {
    const { device_id } = req.params;
    const { chrome_version, os_version } = req.body;

    const device = await Device.findByIdAndUpdate(
      device_id,
      {
        last_sync: new Date(),
        ...(chrome_version && { chrome_version }),
        ...(os_version && { os_version }),
      },
      { new: true }
    );

    res.json({ message: 'Device synced', device });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get device details
router.get('/:device_id', authenticateToken, async (req, res) => {
  try {
    const device = await Device.findById(req.params.device_id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(device);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
