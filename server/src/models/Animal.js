const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  slug: String,
  era: Number,
  type: String,
  animalClass: String,
  habitat: String,
  timePeriod: String,
  diet: String,
  massKg: Number,
  startMya: Number,
  stats: {
    size: Number,
    speed: Number,
    strength: Number,
    defense: Number,
    aggression: Number,
    intelligence: Number
  },
  description: String,
  sourceUrl: String,
  imageUrl: String,
  imageCredit: String,
  imageLicense: String,
  imagePage: String
});

animalSchema.index({ name: 'text' });
animalSchema.index({ era: 1 });
animalSchema.index({ diet: 1 });
animalSchema.index({ habitat: 1 });
animalSchema.index({ animalClass: 1 });

module.exports = mongoose.model('Animal', animalSchema);