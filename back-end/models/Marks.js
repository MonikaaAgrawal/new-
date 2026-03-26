const mongoose = require('mongoose')

const marksSchema = new mongoose.Schema({
  enrollmentNumber: { type: String, required: true, ref: 'Student' },
  studentName:      { type: String },
  subject:          { type: String, required: true },
  facultyId:        { type: String, required: true },
  theoryMarks:      { type: Number, min: 0, max: 100 },
  practicalMarks:   { type: Number, min: 0, max: 100 },
  uploadedVia:      { type: String, enum: ['excel', 'manual'], default: 'manual' }
}, { timestamps: true })

// Prevent duplicate marks for same student+subject
marksSchema.index({ enrollmentNumber: 1, subject: 1 }, { unique: true })

module.exports = mongoose.model('Marks', marksSchema)