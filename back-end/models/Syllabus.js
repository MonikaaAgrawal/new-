const mongoose = require('mongoose')

const unitSchema = new mongoose.Schema({
  unitNumber: { type: Number, required: true },
  title:      { type: String, required: true },
  topics:     [String],
}, { _id: false })

const mstSchema = new mongoose.Schema({
  mstNumber:    { type: Number, enum: [1, 2], required: true },  // MST-1 or MST-2
  syllabus:     { type: String },   // free-text description
  units:        [String],           // which unit numbers are covered
  scheduledDate:{ type: String },   // YYYY-MM-DD
}, { _id: false })

const syllabusSchema = new mongoose.Schema({
  facultyId:      { type: String, required: true },
  subject:        { type: String, required: true },
  subjectCode:    { type: String },
  semester:       { type: Number },
  branch:         { type: String, default: 'IT' },
  academicYear:   { type: String, default: '2024-25' },
  units:          [unitSchema],
  mstSyllabus:    [mstSchema],
  endSemTopics:   { type: String }, // extra notes for end-sem
  referenceBooks: [String],
  lastUpdated:    { type: Date, default: Date.now },
}, { timestamps: true })

syllabusSchema.index({ facultyId: 1, subjectCode: 1 }, { unique: true, sparse: true })
syllabusSchema.index({ facultyId: 1 })

module.exports = mongoose.model('Syllabus', syllabusSchema)