// ✅ Correct — require dotenv first, then call config ONCE
const authRoutes = require('./routes/auth.routes');
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Middleware
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178'],
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/students',  require('./routes/student.routes'));
app.use('/api/tpo',       require('./routes/tpo.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/admin',     require('./routes/admin.routes'));
app.use('/api/faculty', require('./routes/faculty.routes'));
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (req, res) => res.json({ message: 'Academic Placement API is running' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

// Should look something like this at the bottom
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });