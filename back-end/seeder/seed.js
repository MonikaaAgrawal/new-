require('dotenv').config();
const mongoose = require('mongoose');
const Faculty = require('../models/faculty');
const Student = require('../models/Student');

const FACULTY_SEED = [
  {
    facultyId: 'FAC001',
    name: 'Dr. Roopam Gupta',
    email: 'roopam.gupta@acadplace.edu',
    password: 'faculty123',
    subject: 'Advanced Database Management',
    subjectCode: 'IT401',
    department: 'IT',
  },
  {
    facultyId: 'FAC002',
    name: 'Anjana Pandey',
    email: 'anjana.pandey@acadplace.edu',
    password: 'faculty123',
    subject: 'Artificial Intelligence',
    subjectCode: 'IT402',
    department: 'IT',
  },
  {
    facultyId: 'FAC003',
    name: 'Anjana Patney',
    email: 'anjana.patney@acadplace.edu',
    password: 'faculty123',
    subject: 'Cloud Computing',
    subjectCode: 'IT403',
    department: 'IT',
  },
];

const STUDENT_SEED = [
  { enrollmentNumber: '0191IT211001', name: 'Rahul Sharma', branch: 'IT', year: 4, semester: 8, cgpa: 8.2 },
  { enrollmentNumber: '0191IT211002', name: 'Priya Singh', branch: 'IT', year: 4, semester: 8, cgpa: 7.5 },
  { enrollmentNumber: '0191IT211003', name: 'Amit Kumar', branch: 'IT', year: 4, semester: 8, cgpa: 9.0 },
  { enrollmentNumber: '0191IT211004', name: 'Sneha Patel', branch: 'IT', year: 4, semester: 8, cgpa: 6.8 },
  { enrollmentNumber: '0191IT211005', name: 'Vikram Yadav', branch: 'IT', year: 4, semester: 8, cgpa: 7.9 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing
    await Faculty.deleteMany({});
    await Student.deleteMany({});
    console.log('Cleared existing faculty and students');

    // Insert faculty (passwords will be hashed by pre-save hook)
    for (const f of FACULTY_SEED) {
      const faculty = new Faculty(f);
      await faculty.save();
    }
    console.log('✅ 3 Faculty seeded');

    await Student.insertMany(STUDENT_SEED);
    console.log('✅ 5 Students seeded');

    console.log('\nFaculty Login Credentials:');
    FACULTY_SEED.forEach((f) =>
      console.log(`  ${f.name} | email: ${f.email} | password: ${f.password}`)
    );
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();