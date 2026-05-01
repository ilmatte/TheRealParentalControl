const Pairing = require('../models/Pairing');

/**
 * Verify that the device belongs to the authenticated parent
 */
const authDeviceOwner = async (req, res, next) => {
  try {
    const { device_id } = req.params;
    
    if (!device_id) {
      return res.status(400).json({ error: 'device_id is required' });
    }

    const pairing = await Pairing.findOne({
      device_id,
      parent_id: req.user.id,
      status: 'paired',
    });

    if (!pairing) {
      return res.status(403).json({ error: 'Device not paired with this account' });
    }

    // Attach device info to request for use in route handlers
    req.device = pairing;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { authDeviceOwner };
