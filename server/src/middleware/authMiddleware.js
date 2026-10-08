const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production');

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401);
        throw new Error('User account not found');
      }

      return next();
    } catch (error) {
      res.status(401);
      return next(new Error('Not authorized, token invalid or expired'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no bearer token provided'));
  }
};

module.exports = { protect };
