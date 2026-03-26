const express = require('express');
const router = express.Router();
const multer = require('multer');
const facultyCtrl = require('../controllers/faculty.controller');
const { verifyToken, isFaculty, isAdmin } = require('../middleware/auth.middleware');

// Store file in memory for xlsx parsing
const upload = multer({ storage: multer.memoryStorage() });

// ─── Public ───────────────────────────────────────────────────────────────────
router.post('/login', facultyCtrl.loginFaculty);

// ─── Faculty routes (JWT + isFaculty) ─────────────────────────────────────────
router.get('/students',         verifyToken, isFaculty, facultyCtrl.getStudents);
router.get('/dashboard',        verifyToken, isFaculty, facultyCtrl.getDashboardStats);

router.post('/attendance',      verifyToken, isFaculty, facultyCtrl.markAttendance);
router.get('/attendance',       verifyToken, isFaculty, facultyCtrl.getAttendance);
router.get('/attendance/summary/:enrollmentNumber', verifyToken, isFaculty, facultyCtrl.getStudentAttendanceSummary);

router.post('/manual-marks',    verifyToken, isFaculty, facultyCtrl.enterManualMarks);
router.post('/upload-marks',    verifyToken, isFaculty, upload.single('marksFile'), facultyCtrl.uploadMarksExcel);
router.get('/marks',            verifyToken, isFaculty, facultyCtrl.getMarks);

// ─── Admin routes (JWT + isAdmin) ─────────────────────────────────────────────
router.get('/admin/faculty',           verifyToken, isAdmin, facultyCtrl.getAllFaculty);
router.post('/admin/faculty',          verifyToken, isAdmin, facultyCtrl.createFaculty);
router.put('/admin/faculty/:facultyId',    verifyToken, isAdmin, facultyCtrl.updateFaculty);
router.delete('/admin/faculty/:facultyId', verifyToken, isAdmin, facultyCtrl.deleteFaculty);

module.exports = router;