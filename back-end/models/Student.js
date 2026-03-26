const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    enrollmentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    branch: {
      type: String,
      default: 'IT',
    },
    semester: {
      type: Number,
      default: 8,
    },
    year: {
      type: Number,
      default: 4,
    },
    cgpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    phone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);