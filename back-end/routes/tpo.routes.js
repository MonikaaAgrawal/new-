const express = require('express')
const router = express.Router()
const {
  getPlacementReadyStudents, getDrives, createDrive,
  updateApplicantStatus, getTPOStats
} = require('../controllers/tpo.controller')

// ✅ Change this line
const { verifyToken } = require('../middleware/auth.middleware')
const { authorize } = require('../middleware/role.middleware')

// ✅ Use verifyToken instead of protect
router.use(verifyToken, authorize('admin', 'tpo'))

router.get('/placement-ready', getPlacementReadyStudents)
router.get('/stats',           getTPOStats)
router.get('/drives',          getDrives)
router.post('/drives',         createDrive)
router.put('/drives/:driveId/applicant/:studentId', updateApplicantStatus)

module.exports = router