require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Animal = require('../src/models/Animal');

const CSV_FILE = path.join(__dirname, '../data/Animal Dataset.csv');

// Parses weight strings such as "40-65", "Up to 0.5", "318-1,000", "2700-6000" into a clean number
function parseWeight(weightStr) {
  if (!weightStr) return 40;
  const cleaned = weightStr.toString().replace(/,/g, '').trim();
  
  // Handles hyphenated ranges: "40-65" -> 52.5
  const rangeMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    return (parseFloat(rangeMatch[1]) + parseFloat(rangeMatch[2])) / 2;
  }
  
  // Handles "Up to X" or standalone numbers
  const singleMatch = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (singleMatch) {
    return parseFloat(singleMatch[1]);
  }
  
  return 40;
}

// Infers biological class based on traits and common names
function inferClass(name, habitat, diet) {
  const text = `${name} ${habitat} ${diet}`.toLowerCase();
  if (text.includes('frog') || text.includes('axolotl') || text.includes('toad') || text.includes('salamander')) return 'Amphibia';
  if (text.includes('shark') || text.includes('fish') || text.includes('piscivore') || text.includes('arowana')) return 'Actinopterygii / Chondrichthyes';
  if (text.includes('eagle') || text.includes('puffin') || text.includes('bird') || text.includes('owl') || text.includes('falcon')) return 'Aves';
  if (text.includes('dragon') || text.includes('lizard') || text.includes('snake') || text.includes('turtle') || text.includes('croc')) return 'Reptilia';
  return 'Mammalia';
}

// Computes JoJo combat stats (1-10) scaled for modern wildlife
function computeStats(massKg, diet) {
  const safeMass = massKg > 0 ? massKg : 30;
  const size = Math.min(10, Math.max(1, Math.round(Math.log10(safeMass) * 2.2)));
  const strength = Math.min(10, Math.max(1, Math.round(size * 0.9 + (diet.toLowerCase().includes('carnivore') ? 1 : 0))));
  const speed = Math.max(2, Math.min(10, 11 - Math.round(size * 0.6)));
  const defense = Math.min(10, Math.max(1, Math.round(size * 0.65)));
  const aggression = diet.toLowerCase().includes('carnivore') 
    ? Math.min(10, Math.max(6, Math.floor(Math.random() * 3) + 7)) 
    : Math.max(2, Math.floor(Math.random() * 3) + 3);
  const intelligence = size >= 5 ? 6 : 4;

  return { size, speed, strength, defense, aggression, intelligence };
}

async function runImport() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB Atlas.");

  const seenNames = new Set();
  const operations = [];

  fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on('data', (row) => {
      const rawName = row.Animal || row.animal || row.name;
      if (!rawName) return;

      const name = rawName.trim();
      // Skip duplicate entries within the CSV
      if (seenNames.has(name.toLowerCase())) return;
      seenNames.add(name.toLowerCase());

      const massKg = parseWeight(row['Weight (kg)']);
      const diet = row.Diet ? row.Diet.trim() : 'Omnivore';
      const habitat = row.Habitat ? row.Habitat.trim() : 'Global';
      const lifespan = row['Lifespan (years)'] ? row['Lifespan (years)'].trim() : 'Unknown';
      const animalClass = inferClass(name, habitat, diet);

      const record = {
        name,
        animalClass,
        diet,
        habitat,
        era: 3, // Cenozoic
        timePeriod: 'Holocene (Modern)',
        startMya: 0,
        massKg: Math.round(massKg),
        imageUrl: null,
        description: `${name} is an extant ${animalClass.toLowerCase()} inhabiting ${habitat.toLowerCase()}. It maintains an average lifespan of ${lifespan} years with a diet primarily consisting of ${diet.toLowerCase()} sustenance.`,
        stats: computeStats(massKg, diet)
      };

      // Upsert: updates if exists, inserts if new
      operations.push({
        updateOne: {
          filter: { name: record.name },
          update: { $set: record },
          upsert: true
        }
      });
    })
    .on('end', async () => {
      console.log(`Parsed ${operations.length} unique specimens from Animal Dataset.csv.`);

      if (operations.length > 0) {
        try {
          const result = await Animal.bulkWrite(operations, { ordered: false });
          console.log(`Bulk write complete: ${result.upsertedCount} inserted, ${result.modifiedCount} updated.`);
        } catch (err) {
          console.error("Bulk write error:", err.message);
        }
      }

      process.exit(0);
    });
}

runImport();