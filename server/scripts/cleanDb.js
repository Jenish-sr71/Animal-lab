require('dotenv').config();
const mongoose = require('mongoose');
const Animal = require('../src/models/Animal');

async function clean() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');

    const res = await Animal.deleteMany({
      $or: [{ imageUrl: null }, { imageUrl: '' }, { imageUrl: {$exists: false } }]
    });

    console.log(`Purged ${res.deletedCount} specimens without images.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

clean();