const jwt = require('jsonwebtoken');
const Faculty = require('../models/faculty');
// const Student = require('../models/Student');

const JWT_SECRET = process.env.JWT_SECRET || 'acadplace_secret_key';

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Find user based on role
      if (decoded.role === 'faculty') {
        req.user = await Faculty.findById(decoded.id).select('-password');
      } else if (decoded.role === 'student') {
        // req.user = await Student.findById(decoded.id).select('-password');
        req.user = decoded; // Temporary
      } else {
        req.user = decoded;
      }
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      next();
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check if user is faculty
const isFaculty = (req, res, next) => {
  if (req.user && req.user.role === 'faculty') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Faculty only.' });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

module.exports = { 
  verifyToken, 
  isFaculty, 
  isAdmin
};