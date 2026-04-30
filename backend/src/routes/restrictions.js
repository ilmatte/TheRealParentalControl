const express = require('express');
const Restriction = require('../models/Restriction');
const { authenticateToken, authParentOnly } = require('../middleware/auth');

const router = express.Router();

// Create restriction
router.post('/', authParentOnly, async (req, res) => {
  try {
    const {
      child_id,
      device_id,
      blocked_websites,
      allowed_websites,
      daily_time_limit,
      usage_schedule,
    } = req.body;

    const restriction = new Restriction({
      child_id,
      device_id,
      parent_id: req.user.id,
      blocked_websites: blocked_websites || [],
      allowed_websites: allowed_websites || [],
      daily_time_limit: daily_time_limit || 120,
      usage_schedule: usage_schedule || {},
    });

    await restriction.save();
    res.json({ message: 'Restriction created', restriction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get child restrictions
router.get('/child/:child_id', authenticateToken, async (req, res) => {
  try {
    const restrictions = await Restriction.findOne({
      child_id: req.params.child_id,
    }).populate('child_id device_id');

    if (!restrictions) {
      return res.status(404).json({ error: 'No restrictions found' });
    }

    res.json(restrictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update restriction
router.put('/:restriction_id', authParentOnly, async (req, res) => {
  try {
    const restriction = await Restriction.findByIdAndUpdate(
      req.params.restriction_id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    res.json({ message: 'Restriction updated', restriction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Block website
router.post('/:restriction_id/block-website', authParentOnly, async (req, res) => {
  try {
    const { website } = req.body;
    const restriction = await Restriction.findByIdAndUpdate(
      req.params.restriction_id,
      { $push: { blocked_websites: website }, updatedAt: new Date() },
      { new: true }
    );

    res.json({ message: 'Website blocked', restriction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unblock website
router.post('/:restriction_id/unblock-website', authParentOnly, async (req, res) => {
  try {
    const { website } = req.body;
    const restriction = await Restriction.findByIdAndUpdate(
      req.params.restriction_id,
      { $pull: { blocked_websites: website }, updatedAt: new Date() },
      { new: true }
    );

    res.json({ message: 'Website unblocked', restriction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lock screen
router.post('/:restriction_id/lock-screen', authParentOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const restriction = await Restriction.findByIdAndUpdate(
      req.params.restriction_id,
      {
        'screen_lock.enabled': true,
        'screen_lock.locked_at': new Date(),
        'screen_lock.reason': reason,
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.json({ message: 'Screen locked', restriction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unlock screen
router.post('/:restriction_id/unlock-screen', authParentOnly, async (req, res) => {
  try {
    const restriction = await Restriction.findByIdAndUpdate(
      req.params.restriction_id,
      {
        'screen_lock.enabled': false,
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.json({ message: 'Screen unlocked', restriction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
