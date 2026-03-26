const Student = require('../models/Student')

const calculateReadinessScore = (student) => {
  let score = 0
  if (student.cgpa >= 9.0)      score += 30
  else if (student.cgpa >= 8.0) score += 25
  else if (student.cgpa >= 7.0) score += 20
  else if (student.cgpa >= 6.0) score += 13
  else if (student.cgpa >= 5.0) score += 8
  else                          score += 3
  score -= (student.activeBacklogs || 0) * 5
  const totalSkills = (student.technicalSkills?.length || 0) + (student.programmingLanguages?.length || 0)
  score += Math.min(25, totalSkills * 2.5)
  const majorProjects = student.projects?.filter(p => p.type === 'major').length || 0
  const minorProjects = student.projects?.filter(p => p.type === 'minor').length || 0
  score += Math.min(20, majorProjects * 8 + minorProjects * 3)
  const completedInternships = student.internships?.filter(i => i.isCompleted).length || 0
  score += Math.min(15, completedInternships * 8)
  score += Math.min(10, (student.certifications?.length || 0) * 3)
  return Math.min(100, Math.max(0, Math.round(score)))
}

const analyzeSkillGap = (student) => {
  const TOP_SKILLS = ['JavaScript','Python','Java','React','Node.js','SQL','MongoDB','Git','AWS','Docker','Machine Learning','Data Structures','System Design','REST API','TypeScript']
  const studentSkills = [...(student.technicalSkills || []), ...(student.programmingLanguages || [])].map(s => s.toLowerCase())
  return TOP_SKILLS.filter(skill => !studentSkills.includes(skill.toLowerCase())).slice(0, 5)
}

const recalculateScore = async (req, res) => {
  try {
    const student = await Student.findOne({ enrollmentNumber: req.params.enrollmentNumber.toUpperCase() })
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' })
    student.placementReadinessScore = calculateReadinessScore(student)
    student.skillGaps       = analyzeSkillGap(student)
    student.suggestedSkills = student.skillGaps.slice(0, 3)
    await student.save()
    res.json({ success: true, score: student.placementReadinessScore, skillGaps: student.skillGaps, data: student })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const recalculateAllScores = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true })
    for (const student of students) {
      student.placementReadinessScore = calculateReadinessScore(student)
      student.skillGaps       = analyzeSkillGap(student)
      student.suggestedSkills = student.skillGaps.slice(0, 3)
      await student.save()
    }
    res.json({ success: true, message: `Updated scores for ${students.length} students` })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getDepartmentAnalytics = async (req, res) => {
  try {
    const [cgpaDistribution, skillPopularity, placementStats, internshipStats, readinessDistribution] = await Promise.all([
      Student.aggregate([{ $match: { isActive: true } }, { $bucket: { groupBy: '$cgpa', boundaries: [0,5,6,7,8,9,10], default: 'Other', output: { count: { $sum: 1 } } } }]),
      Student.aggregate([{ $match: { isActive: true } }, { $unwind: '$technicalSkills' }, { $group: { _id: '$technicalSkills', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 15 }]),
      Student.aggregate([{ $match: { isActive: true } }, { $group: { _id: '$placementStatus', count: { $sum: 1 } } }]),
      Student.aggregate([{ $match: { isActive: true } }, { $project: { hasInternship: { $gt: [{ $size: { $ifNull: ['$internships', []] } }, 0] } } }, { $group: { _id: '$hasInternship', count: { $sum: 1 } } }]),
      Student.aggregate([{ $match: { isActive: true } }, { $bucket: { groupBy: '$placementReadinessScore', boundaries: [0,20,40,60,80,100], default: 'Other', output: { count: { $sum: 1 } } } }])
    ])
    const avgCGPA = await Student.aggregate([{ $match: { isActive: true } }, { $group: { _id: null, avg: { $avg: '$cgpa' } } }])
    res.json({ success: true, data: { cgpaDistribution, skillPopularity, placementStats, internshipStats, readinessDistribution, avgCGPA: avgCGPA[0]?.avg?.toFixed(2) || 0 } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getTopPerformers = async (req, res) => {
  try {
    const topByCGPA      = await Student.find({ isActive: true }).select('enrollmentNumber name cgpa technicalSkills placementReadinessScore').sort({ cgpa: -1 }).limit(10)
    const topByReadiness = await Student.find({ isActive: true }).select('enrollmentNumber name cgpa technicalSkills placementReadinessScore').sort({ placementReadinessScore: -1 }).limit(10)
    res.json({ success: true, data: { topByCGPA, topByReadiness } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { recalculateScore, recalculateAllScores, getDepartmentAnalytics, getTopPerformers, calculateReadinessScore, analyzeSkillGap }