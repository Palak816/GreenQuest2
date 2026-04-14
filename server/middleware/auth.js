const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  req.user = { id: '507f1f77bcf86cd799439011', role: 'student', username: 'Eco Explorer' };
  next();
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    next();
  };
};
