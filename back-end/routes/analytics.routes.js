const express = require('express')
const router = express.Router()
const {
  recalculateScore,
  recalculateAllScores,
  getDepartmentAnalytics,
  getTopPerformers
} = require('../controllers/analytics.controller')

// ✅ Change this line
const { verifyToken } = require('../middleware/auth.middleware')
const { authorize } = require('../middleware/role.middleware')

// ✅ Use verifyToken instead of protect
router.get('/department',    verifyToken, authorize('admin', 'tpo'), getDepartmentAnalytics)
router.get('/top-performers', verifyToken, authorize('admin', 'tpo'), getTopPerformers)
router.post('/score/:enrollmentNumber', verifyToken, authorize('admin', 'tpo', 'student'), recalculateScore)
router.post('/recalculate-all', verifyToken, authorize('admin'), recalculateAllScores)

module.exports = router