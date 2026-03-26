const jwt      = require('jsonwebtoken')
const XLSX     = require('xlsx')
const Faculty  = require('../models/faculty')
const Student  = require('../models/Student')
const Attendance = require('../models/Attendance')
const Marks    = require('../models/Marks')

const JWT_SECRET = process.env.JWT_SECRET || 'acadplace_secret_key'

// ─── AUTH ────────────────────────────────────────────────────────────────────

/**
 * POST /api/faculty/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' })

    const faculty = await Faculty.findOne({ email })
    if (!faculty || faculty.password !== password)
      return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign(
      { id: faculty._id, facultyId: faculty.facultyId, name: faculty.name,
        subject: faculty.subject, role: 'faculty' },
      JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({
      token,
      faculty: {
        facultyId: faculty.facultyId,
        name:      faculty.name,
        email:     faculty.email,
        subject:   faculty.subject,
        subjectCode: faculty.subjectCode,
        role:      'faculty'
      }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── STUDENTS ────────────────────────────────────────────────────────────────

/**
 * GET /api/faculty/students
 * Returns 4th year (sem 7 or 8) IT students
 * Query: ?search=enrollmentNumber|name
 */
exports.getStudents = async (req, res) => {
  try {
    const { search } = req.query
    const query = {
      branch: { $regex: /IT|Information Technology/i },
      semester: { $in: [7, 8, '7', '8'] }
    }

    if (search) {
      query.$or = [
        { enrollmentNumber: { $regex: search, $options: 'i' } },
        { name:             { $regex: search, $options: 'i' } }
      ]
    }

    const students = await Student.find(query)
      .select('enrollmentNumber name semester cgpa skills')
      .sort({ enrollmentNumber: 1 })

    res.json({ count: students.length, students })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────

/**
 * POST /api/faculty/attendance
 * Body: { records: [{ enrollmentNumber, date, status }] }
 * Bulk mark attendance for the faculty's subject
 */
exports.markAttendance = async (req, res) => {
  try {
    const { records } = req.body
    const { facultyId, subject } = req.user

    if (!records || !Array.isArray(records) || records.length === 0)
      return res.status(400).json({ message: 'records array is required' })

    const results = { success: [], failed: [] }

    for (const rec of records) {
      const { enrollmentNumber, date, status } = rec
      if (!enrollmentNumber || !date || !status) {
        results.failed.push({ enrollmentNumber, reason: 'Missing fields' })
        continue
      }

      // Validate student exists
      const student = await Student.findOne({ enrollmentNumber })
      if (!student) {
        results.failed.push({ enrollmentNumber, reason: 'Student not found' })
        continue
      }

      try {
        await Attendance.findOneAndUpdate(
          { enrollmentNumber, subject, date },
          { enrollmentNumber, subject, facultyId, date, status },
          { upsert: true, new: true }
        )
        results.success.push(enrollmentNumber)
      } catch (e) {
        results.failed.push({ enrollmentNumber, reason: e.message })
      }
    }

    res.json({
      message: `${results.success.length} records saved, ${results.failed.length} failed`,
      ...results
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * GET /api/faculty/attendance?date=YYYY-MM-DD
 */
exports.getAttendance = async (req, res) => {
  try {
    const { date } = req.query
    const { facultyId, subject } = req.user
    const filter = { facultyId, subject }
    if (date) filter.date = date

    const records = await Attendance.find(filter).sort({ date: -1 })
    res.json({ count: records.length, records })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── MARKS ───────────────────────────────────────────────────────────────────

/**
 * POST /api/faculty/manual-marks
 * Body: { enrollmentNumber, theoryMarks, practicalMarks }
 */
exports.enterManualMarks = async (req, res) => {
  try {
    const { enrollmentNumber, theoryMarks, practicalMarks } = req.body
    const { facultyId, subject } = req.user

    if (!enrollmentNumber)
      return res.status(400).json({ message: 'enrollmentNumber is required' })

    const student = await Student.findOne({ enrollmentNumber })
    if (!student)
      return res.status(404).json({ message: `Student ${enrollmentNumber} not found` })

    const marks = await Marks.findOneAndUpdate(
      { enrollmentNumber, subject },
      {
        enrollmentNumber,
        studentName:    student.name,
        subject,
        facultyId,
        theoryMarks:    Number(theoryMarks),
        practicalMarks: Number(practicalMarks),
        uploadedVia:    'manual'
      },
      { upsert: true, new: true }
    )

    res.json({ message: 'Marks saved successfully', marks })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * POST /api/faculty/upload-marks  (multipart/form-data — file field: "marksFile")
 * Parses Excel: EnrollmentNumber | StudentName | TheoryMarks | PracticalMarks
 */
exports.uploadMarksExcel = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: 'No file uploaded' })

    const { facultyId, subject } = req.user

    const workbook  = XLSX.read(req.file.buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const rows      = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

    if (!rows.length)
      return res.status(400).json({ message: 'Excel file is empty' })

    // Normalize headers (case-insensitive)
    const normalize = (row) => {
      const out = {}
      for (const [k, v] of Object.entries(row)) {
        const key = k.toLowerCase().replace(/\s/g, '')
        out[key] = v
      }
      return out
    }

    const results = { success: [], failed: [], total: rows.length }

    for (const rawRow of rows) {
      const row = normalize(rawRow)
      const enrollmentNumber =
        String(row['enrollmentnumber'] || row['enrollment'] || row['enrollmentno'] || '').trim()

      if (!enrollmentNumber) {
        results.failed.push({ row: rawRow, reason: 'Missing enrollment number' })
        continue
      }

      const student = await Student.findOne({ enrollmentNumber })
      if (!student) {
        results.failed.push({ enrollmentNumber, reason: 'Student not found in DB' })
        continue
      }

      const theoryMarks    = Number(row['theorymarks']    || row['theory']    || 0)
      const practicalMarks = Number(row['practicalmarks'] || row['practical'] || 0)
      const studentName    = row['studentname'] || row['name'] || student.name

      try {
        await Marks.findOneAndUpdate(
          { enrollmentNumber, subject },
          { enrollmentNumber, studentName, subject, facultyId, theoryMarks, practicalMarks, uploadedVia: 'excel' },
          { upsert: true, new: true }
        )
        results.success.push(enrollmentNumber)
      } catch (e) {
        results.failed.push({ enrollmentNumber, reason: e.message })
      }
    }

    res.json({
      message: `${results.success.length}/${results.total} records uploaded successfully`,
      ...results
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * GET /api/faculty/marks
 */
exports.getMarks = async (req, res) => {
  try {
    const { facultyId, subject } = req.user
    const marks = await Marks.find({ facultyId, subject }).sort({ enrollmentNumber: 1 })
    res.json({ count: marks.length, marks })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── ADMIN: FACULTY LIST ──────────────────────────────────────────────────────

/**
 * GET /api/faculty/all  (admin only)
 */
exports.getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find().select('-password')
    res.json({ faculty })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}