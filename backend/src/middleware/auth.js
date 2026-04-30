const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const authParentOnly = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can perform this action' });
    }
    next();
  });
};

const authChildOnly = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'child') {
      return res.status(403).json({ error: 'Only children can perform this action' });
    }
    next();
  });
};

module.exports = { authenticateToken, authParentOnly, authChildOnly };
