const express  = require('express')
const router   = express.Router()
const {
  getFacultyProfile,
  getStudents,
  getAttendance,
  markAttendance,
  getMarks,
  uploadMarks,
  manualMarks,
} = require('../controllers/faculty.controller')
const {
  getSyllabus,
  saveSyllabus,
  upsertUnit,
  deleteUnit,
  upsertMST,
} = require('../controllers/syllabus.controller')
const { verifyToken } = require('../middleware/auth.middleware')
const upload = require('../middleware/upload.middleware')

router.use(verifyToken)

// ── Existing routes ────────────────────────────────────────────────────────
router.get('/profile',       getFacultyProfile)
router.get('/students',      getStudents)
router.get('/attendance',    getAttendance)
router.get('/marks',         getMarks)
router.post('/attendance',   markAttendance)
router.post('/upload-marks', upload.single('file'), uploadMarks)
router.post('/manual-marks', manualMarks)

// ── Syllabus routes ────────────────────────────────────────────────────────
router.get('/syllabus',              getSyllabus)   // fetch full syllabus
router.post('/syllabus',             saveSyllabus)  // save/replace full syllabus
router.patch('/syllabus/unit',       upsertUnit)    // add or update one unit
router.delete('/syllabus/unit/:unitNumber', deleteUnit) // remove a unit
router.patch('/syllabus/mst',        upsertMST)     // add or update MST entry

module.exports = router