const mongoose = require('mongoose')

const placementDriveSchema = new mongoose.Schema({
  companyName:      { type: String, required: true },
  jobRole:          { type: String, required: true },
  driveDate:        { type: Date },
  package:          { type: Number },
  eligibilityCGPA:  { type: Number, default: 6.0 },
  requiredSkills:   [String],
  jobType:          { type: String, enum: ['full_time', 'internship', 'ppo'], default: 'full_time' },
  location:         { type: String },
  description:      { type: String },
  applicants: [{
    student:   { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    status:    { type: String, enum: ['applied', 'shortlisted', 'selected', 'rejected'], default: 'applied' },
    appliedAt: { type: Date, default: Date.now }
  }],
  isActive:    { type: Boolean, default: true },
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('PlacementDrive', placementDriveSchema)