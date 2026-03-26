const mongoose = require('mongoose')

const facultySchema = new mongoose.Schema({
  facultyId:  { type: String, required: true, unique: true },
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  subject:    { type: String, required: true },
  subjectCode:{ type: String },
  role:       { type: String, default: 'faculty' }
}, { timestamps: true })


module.exports = mongoose.models.Faculty || mongoose.model('Faculty', facultySchema);