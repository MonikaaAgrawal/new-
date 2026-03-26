const User = require('../models/User')
const Student = require('../models/Student')
const fs = require('fs')
const csv = require('csv-parser')
const { calculateReadinessScore, analyzeSkillGap } = require('./analytics.controller')

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json({ success: true, data: users })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, enrollmentNumber } = req.body
    const user = await User.create({ name, email, password, role, enrollmentNumber })
    res.status(201).json({ success: true, data: { id: user._id, name, email, role, enrollmentNumber } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    user.isActive = !user.isActive
    await user.save()
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const uploadStudentsCSV = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' })
  const results = []
  const errors  = []
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => results.push(row))
    .on('end', async () => {
      let created = 0, skipped = 0
      for (const row of results) {
        try {
          const exists = await Student.findOne({ enrollmentNumber: row.enrollmentNumber?.toUpperCase() })
          if (exists) { skipped++; continue }
          const studentData = {
            enrollmentNumber:     row.enrollmentNumber?.toUpperCase(),
            name:                 row.name,
            email:                row.email,
            phone:                row.phone,
            division:             row.division,
            batch:                row.batch,
            cgpa:                 parseFloat(row.cgpa) || 0,
            technicalSkills:      row.technicalSkills      ? row.technicalSkills.split('|')      : [],
            programmingLanguages: row.programmingLanguages ? row.programmingLanguages.split('|') : []
          }
          const student = new Student(studentData)
          student.placementReadinessScore = calculateReadinessScore(student)
          student.skillGaps = analyzeSkillGap(student)
          await student.save()
          created++
        } catch (err) {
          errors.push({ row: row.enrollmentNumber, error: err.message })
        }
      }
      fs.unlinkSync(req.file.path)
      res.json({ success: true, message: `Created: ${created}, Skipped: ${skipped}`, errors })
    })
}

const getAdminStats = async (req, res) => {
  try {
    const [totalStudents, totalUsers, placed, avgCGPA] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
      Student.countDocuments({ isActive: true, placementStatus: 'placed' }),
      Student.aggregate([{ $match: { isActive: true } }, { $group: { _id: null, avg: { $avg: '$cgpa' } } }])
    ])
    res.json({ success: true, data: { totalStudents, totalUsers, placed, avgCGPA: avgCGPA[0]?.avg?.toFixed(2) || 0, placementRate: totalStudents > 0 ? ((placed / totalStudents) * 100).toFixed(1) : 0 } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getAllUsers, createUser, toggleUserStatus, uploadStudentsCSV, getAdminStats }