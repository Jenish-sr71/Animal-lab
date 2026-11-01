const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// 1. API routes
const animalRoutes = require('./routes/animals'); // or './src/routes/animals'
app.use('/animals', animalRoutes);

// 2. Direct Backend Admin UI route
const adminController = require('./controllers/adminController'); // or './src/controllers/adminController'
app.get('/admin', adminController.renderAdminDashboard);

module.exports = app;
require('dotenv').config();
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`⚔️ Server running on http://localhost:${PORT}`);
      console.log(`🛡️ Admin Console: http://localhost:${PORT}/admin`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
  });