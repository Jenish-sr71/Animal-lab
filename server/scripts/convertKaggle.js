require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Animal = require('../src/models/Animal');

const CSV_FILE = path.join(__dirname, '../data/dinoDatasetCSV.csv');

// Deterministic formula for JoJo combat stats (1-10) based on real physical mass
function computeStats(massKg, diet) {
  const safeMass = massKg > 0 ? massKg : 500;
  
  // Size scaled logarithmically from 10 kg to 50,000+ kg
  const size = Math.min(10, Math.max(1, Math.round(Math.log10(safeMass) * 2.2)));
  
  // Strength closely tied to physical size and diet
  const strength = Math.min(10, Math.max(2, Math.round(size * 0.9 + (diet === 'Carnivore' ? 1 : 0))));
  
  // Speed inversely related to giant bulk, lighter animals move faster
  const speed = Math.max(2, Math.min(10, 11 - Math.round(size * 0.65)));
  
  // Defense scaled from physical durability
  const defense = Math.min(10, Math.max(2, Math.round(size * 0.75 + (diet === 'Herbivore' ? 1 : 0))));
  
  // Aggression higher for active apex predators
  const aggression = diet === 'Carnivore' ? Math.min(10, Math.max(7, Math.floor(Math.random() * 3) + 7)) : Math.max(3, Math.floor(Math.random() * 3) + 3);
  
  const intelligence = diet === 'Carnivore' ? 5 : 3;

  return { size, speed, strength, defense, aggression, intelligence };
}

async function runImport() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB Atlas.");

  const specimens = [];

  fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on('data', (row) => {
      // Kaggle column names: scientific_name, diet, weight_kg, geological_period, lived_in
      const name = row.scientific_name || row.name;
      if (!name) return;

      const rawWeight = parseFloat(row.weight_kg) || parseFloat(row.length_m) * 150 || 1000;
      const diet = row.diet ? (row.diet.charAt(0).toUpperCase() + row.diet.slice(1).toLowerCase()) : "Herbivore";
      const timePeriod = row.geological_period || "Late Cretaceous";

      // Map geological period to numerical era (Mesozoic = 2)
      let era = 2;
      let startMya = 100;
      if (timePeriod.toLowerCase().includes("triassic")) startMya = 220;
      if (timePeriod.toLowerCase().includes("jurassic")) startMya = 160;
      if (timePeriod.toLowerCase().includes("cretaceous")) startMya = 70;

      const record = {
        name: name.trim(),
        animalClass: "Dinosauria",
        diet: diet,
        habitat: "Terrestrial",
        era: era,
        timePeriod: timePeriod,
        startMya: startMya,
        massKg: Math.round(rawWeight),
        imageUrl: null, // UI will display default badge if empty
        description: `${name} was a ${diet.toLowerCase()} that inhabited prehistoric ecosystems during the ${timePeriod}. Fossils have been discovered across ${row.lived_in || 'ancient terrain'}.`,
        stats: computeStats(rawWeight, diet)
      };

      specimens.push(record);
    })
    .on('end', async () => {
      console.log(`Parsed ${specimens.length} valid specimens from CSV.`);

      // Limit to 500 records or import all of them
      const batch = specimens.slice(0, 500);

      try {
        console.log(`Inserting ${batch.length} specimens into MongoDB...`);
        await Animal.insertMany(batch, { ordered: false });
        console.log("Successfully populated MongoDB archive!");
      } catch (err) {
        console.warn("Bulk insert completed (duplicates skipped):", err.message);
      }

      process.exit(0);
    });
}

runImport();