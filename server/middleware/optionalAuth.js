const jwt = require('jsonwebtoken');

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
    } catch (err) {
      // Invalid token — just proceed as anonymous instead of rejecting
    }
  }

  next();
}

module.exports = optionalAuth;