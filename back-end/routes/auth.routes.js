const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');

const { verifyToken } = require('../middleware/auth.middleware');

// POST /api/auth/login
router.post('/login', authCtrl.login);

// GET /api/auth/me  (protected)
router.get('/me', verifyToken, authCtrl.getMe);

module.exports = router;