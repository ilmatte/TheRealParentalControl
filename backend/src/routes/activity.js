const express = require('express');
const Activity = require('../models/Activity');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Log activity
router.post('/log', authenticateToken, async (req, res) => {
  try {
    const { activity_type, details } = req.body;

    const activity = new Activity({
      child_id: req.user.id,
      device_id: req.body.device_id,
      activity_type,
      details,
      timestamp: new Date(),
    });

    await activity.save();
    res.json({ message: 'Activity logged', activity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get child activity history
router.get('/child/:child_id', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, limit = 100 } = req.query;

    const query = { child_id: req.params.child_id };

    if (start_date || end_date) {
      query.timestamp = {};
      if (start_date) query.timestamp.$gte = new Date(start_date);
      if (end_date) query.timestamp.$lte = new Date(end_date);
    }

    const activities = await Activity.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('child_id device_id');

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get website visits summary
router.get('/child/:child_id/websites', authenticateToken, async (req, res) => {
  try {
    const websites = await Activity.aggregate([
      {
        $match: {
          child_id: require('mongoose').Types.ObjectId(req.params.child_id),
          activity_type: 'website_visit',
        },
      },
      {
        $group: {
          _id: '$details.url',
          visits: { $sum: 1 },
          lastVisit: { $max: '$timestamp' },
          totalTime: { $sum: '$details.duration' },
        },
      },
      { $sort: { visits: -1 } },
      { $limit: 50 },
    ]);

    res.json(websites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get daily screen time
router.get('/child/:child_id/screen-time', authenticateToken, async (req, res) => {
  try {
    const screenTime = await Activity.aggregate([
      {
        $match: {
          child_id: require('mongoose').Types.ObjectId(req.params.child_id),
          activity_type: 'screen_time',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          totalTime: { $sum: '$details.duration' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.json(screenTime);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
