const Student = require('../models/Student')
const PlacementDrive = require('../models/Placement')

const getPlacementReadyStudents = async (req, res) => {
  try {
    const { minScore = 60, minCGPA = 6.0, limit = 50 } = req.query
    const students = await Student.find({
      isActive: true,
      placementReadinessScore: { $gte: parseFloat(minScore) },
      cgpa: { $gte: parseFloat(minCGPA) },
      placementStatus: { $in: ['not_started', 'in_process'] },
      activeBacklogs: 0
    }).select('enrollmentNumber name cgpa technicalSkills placementReadinessScore placementStatus internships').sort({ placementReadinessScore: -1 }).limit(parseInt(limit))
    res.json({ success: true, count: students.length, data: students })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getDrives = async (req, res) => {
  try {
    const drives = await PlacementDrive.find().populate('applicants.student', 'name enrollmentNumber cgpa').sort({ driveDate: -1 })
    res.json({ success: true, data: drives })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const createDrive = async (req, res) => {
  try {
    const drive = await PlacementDrive.create(req.body)
    res.status(201).json({ success: true, data: drive })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const updateApplicantStatus = async (req, res) => {
  try {
    const { status } = req.body
    const drive = await PlacementDrive.findById(req.params.driveId)
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' })
    const applicant = drive.applicants.find(a => a.student.toString() === req.params.studentId)
    if (!applicant) return res.status(404).json({ success: false, message: 'Applicant not found' })
    applicant.status = status
    if (status === 'selected') {
      await Student.findByIdAndUpdate(req.params.studentId, { placementStatus: 'placed', placedCompany: drive.companyName, placedPackage: drive.package, offerDate: new Date() })
    }
    await drive.save()
    res.json({ success: true, data: drive })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getTPOStats = async (req, res) => {
  try {
    const [total, placed, inProcess, optedOut, higherStudies] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Student.countDocuments({ isActive: true, placementStatus: 'placed' }),
      Student.countDocuments({ isActive: true, placementStatus: 'in_process' }),
      Student.countDocuments({ isActive: true, placementStatus: 'opted_out' }),
      Student.countDocuments({ isActive: true, placementStatus: 'higher_studies' })
    ])
    const avgPackage = await Student.aggregate([{ $match: { isActive: true, placementStatus: 'placed', placedPackage: { $gt: 0 } } }, { $group: { _id: null, avg: { $avg: '$placedPackage' }, max: { $max: '$placedPackage' } } }])
    const topCompanies = await Student.aggregate([{ $match: { isActive: true, placementStatus: 'placed', placedCompany: { $ne: null } } }, { $group: { _id: '$placedCompany', count: { $sum: 1 }, avgPackage: { $avg: '$placedPackage' } } }, { $sort: { count: -1 } }, { $limit: 10 }])
    res.json({ success: true, data: { total, placed, inProcess, optedOut, higherStudies, notStarted: total - placed - inProcess - optedOut - higherStudies, placementPercentage: total > 0 ? ((placed / total) * 100).toFixed(1) : 0, avgPackage: avgPackage[0]?.avg?.toFixed(2) || 0, maxPackage: avgPackage[0]?.max || 0, topCompanies } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getPlacementReadyStudents, getDrives, createDrive, updateApplicantStatus, getTPOStats }