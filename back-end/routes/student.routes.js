const express = require('express')
const router  = express.Router()
const {
  getAllStudents, getStudentByEnrollment, createStudent,
  updateStudent, deleteStudent, addProject, addCertification,
  getAttendance, updateAttendance, bulkUpdateAttendance, deleteAttendance,
  updateSemesterSubjects
} = require('../controllers/student.controller')

// ✅ Fix these imports
const { verifyToken } = require('../middleware/auth.middleware')
const { authorize } = require('../middleware/role.middleware')  // Make sure this file exists

// Use verifyToken instead of protect
router.get('/',    verifyToken, authorize('admin', 'tpo'), getAllStudents)
router.post('/',   verifyToken, authorize('admin'), createStudent)
router.get('/:enrollmentNumber',    verifyToken, getStudentByEnrollment)
router.put('/:enrollmentNumber',    verifyToken, updateStudent)
router.delete('/:enrollmentNumber', verifyToken, authorize('admin'), deleteStudent)

router.post('/:enrollmentNumber/projects',       verifyToken, addProject)
router.post('/:enrollmentNumber/certifications', verifyToken, addCertification)

// Semester subjects/marks route
router.put('/:enrollmentNumber/semester/:sem/subjects', verifyToken, updateSemesterSubjects)

// Attendance routes
router.get('/:enrollmentNumber/attendance', verifyToken, getAttendance)

router.post('/:enrollmentNumber/attendance', verifyToken, authorize('admin', 'tpo'), updateAttendance)

router.put('/:enrollmentNumber/attendance/bulk', verifyToken, authorize('admin', 'tpo'), bulkUpdateAttendance)

router.delete('/:enrollmentNumber/attendance/:subject', verifyToken, authorize('admin', 'tpo'), deleteAttendance)

module.exports = router