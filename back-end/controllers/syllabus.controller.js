const Syllabus = require('../models/Syllabus')
const Faculty  = require('../models/faculty')

const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

// ─── Helper: get facultyId from JWT payload ────────────────────────────────
// req.user may be the full Faculty doc (when resolved from DB) or the decoded token
function getFacultyId(req) {
  return req.user?.facultyId || req.user?.enrollmentNumber || null
}

// ─── GET /api/faculty/syllabus ─────────────────────────────────────────────
const getSyllabus = asyncHandler(async (req, res) => {
  const facultyId = getFacultyId(req)
  if (!facultyId) return res.status(401).json({ success: false, message: 'Not authenticated' })

  let syllabus = await Syllabus.findOne({ facultyId })

  if (!syllabus) {
    // Return empty scaffold so frontend can display the form
    const faculty = await Faculty.findOne({ facultyId })
    return res.json({
      success: true,
      data: {
        facultyId,
        subject:     faculty?.subject     || '',
        subjectCode: faculty?.subjectCode || '',
        units:       [],
        mstSyllabus: [],
        referenceBooks: [],
        endSemTopics: '',
        academicYear: '2024-25',
      },
      isNew: true,
    })
  }

  res.json({ success: true, data: syllabus, isNew: false })
})

// ─── POST /api/faculty/syllabus  (create or full-replace) ─────────────────
const saveSyllabus = asyncHandler(async (req, res) => {
  const facultyId = getFacultyId(req)
  if (!facultyId) return res.status(401).json({ success: false, message: 'Not authenticated' })

  const faculty = await Faculty.findOne({ facultyId })
  if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' })

  const {
    units = [],
    mstSyllabus = [],
    referenceBooks = [],
    endSemTopics = '',
    academicYear,
    semester,
  } = req.body

  const syllabus = await Syllabus.findOneAndUpdate(
    { facultyId },
    {
      $set: {
        facultyId,
        subject:      faculty.subject,
        subjectCode:  faculty.subjectCode,
        units,
        mstSyllabus,
        referenceBooks,
        endSemTopics,
        academicYear: academicYear || '2024-25',
        semester:     semester || null,
        lastUpdated:  new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  res.status(201).json({ success: true, data: syllabus })
})

// ─── PATCH /api/faculty/syllabus/unit  (add / update a single unit) ────────
const upsertUnit = asyncHandler(async (req, res) => {
  const facultyId = getFacultyId(req)
  const { unitNumber, title, topics = [] } = req.body

  if (!unitNumber || !title)
    return res.status(400).json({ success: false, message: 'unitNumber and title required' })

  let syllabus = await Syllabus.findOne({ facultyId })
  if (!syllabus) {
    const faculty = await Faculty.findOne({ facultyId })
    syllabus = new Syllabus({
      facultyId,
      subject:     faculty?.subject     || '',
      subjectCode: faculty?.subjectCode || '',
    })
  }

  const idx = syllabus.units.findIndex(u => u.unitNumber === unitNumber)
  if (idx >= 0) {
    syllabus.units[idx] = { unitNumber, title, topics }
  } else {
    syllabus.units.push({ unitNumber, title, topics })
    syllabus.units.sort((a, b) => a.unitNumber - b.unitNumber)
  }
  syllabus.lastUpdated = new Date()
  await syllabus.save()

  res.json({ success: true, data: syllabus })
})

// ─── DELETE /api/faculty/syllabus/unit/:unitNumber ─────────────────────────
const deleteUnit = asyncHandler(async (req, res) => {
  const facultyId = getFacultyId(req)
  const unitNumber = parseInt(req.params.unitNumber)

  const syllabus = await Syllabus.findOne({ facultyId })
  if (!syllabus) return res.status(404).json({ success: false, message: 'Syllabus not found' })

  syllabus.units = syllabus.units.filter(u => u.unitNumber !== unitNumber)
  syllabus.lastUpdated = new Date()
  await syllabus.save()

  res.json({ success: true, data: syllabus })
})

// ─── PATCH /api/faculty/syllabus/mst  (add / update MST entry) ────────────
const upsertMST = asyncHandler(async (req, res) => {
  const facultyId = getFacultyId(req)
  const { mstNumber, syllabus: mstText = '', units = [], scheduledDate = '' } = req.body

  if (![1, 2].includes(Number(mstNumber)))
    return res.status(400).json({ success: false, message: 'mstNumber must be 1 or 2' })

  let doc = await Syllabus.findOne({ facultyId })
  if (!doc) {
    const faculty = await Faculty.findOne({ facultyId })
    doc = new Syllabus({
      facultyId,
      subject:     faculty?.subject     || '',
      subjectCode: faculty?.subjectCode || '',
    })
  }

  const idx = doc.mstSyllabus.findIndex(m => m.mstNumber === Number(mstNumber))
  const entry = { mstNumber: Number(mstNumber), syllabus: mstText, units, scheduledDate }
  if (idx >= 0) {
    doc.mstSyllabus[idx] = entry
  } else {
    doc.mstSyllabus.push(entry)
    doc.mstSyllabus.sort((a, b) => a.mstNumber - b.mstNumber)
  }
  doc.lastUpdated = new Date()
  await doc.save()

  res.json({ success: true, data: doc })
})

module.exports = { getSyllabus, saveSyllabus, upsertUnit, deleteUnit, upsertMST }