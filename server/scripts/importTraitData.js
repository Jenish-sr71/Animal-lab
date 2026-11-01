require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Animal = require('../src/models/Animal');

const CSV_FILE = path.join(__dirname, '../data/Trait_data.csv');

// Infert diet category from the taxonomic Order column
function inferDiet(order, family) {
  const ord = (order || '').toLowerCase();
  const fam = (family || '').toLowerCase();

  if (ord.includes('carnivora') || ord.includes('cetacea')) return 'Carnivore';
  if (ord.includes('rodentia') || ord.includes('lagomorpha') || ord.includes('perissodactyla') || ord.includes('artiodactyla') || ord.includes('proboscidea') || ord.includes('diprotodontia')) return 'Herbivore';
  if (ord.includes('primates')) return 'Omnivore';
  if (ord.includes('chiroptera') || ord.includes('eulipotyphla') || fam.includes('myrmecophagidae')) return 'Insectivore';
  return 'Herbivore';
}

// Infer habitat from the PHYLACINE binary flags
function inferHabitat(row) {
  if (row.Marine === '1') return 'Marine';
  if (row.Freshwater === '1') return 'Freshwater';
  if (row.Aerial === '1') return 'Aerial / Forest Canopy';
  return 'Terrestrial';
}

// Compute JoJo combat stats scaled for mammals
function computeStats(massKg, diet) {
  const safeMass = massKg > 0 ? massKg : 5;
  const size = Math.min(10, Math.max(1, Math.round(Math.log10(safeMass) * 2.1)));
  const strength = Math.min(10, Math.max(1, Math.round(size * 0.9 + (diet === 'Carnivore' ? 1 : 0))));
  const speed = Math.max(2, Math.min(10, 11 - Math.round(size * 0.6)));
  const defense = Math.min(10, Math.max(1, Math.round(size * 0.65)));
  const aggression = diet === 'Carnivore' 
    ? Math.min(10, Math.max(6, Math.floor(Math.random() * 3) + 7)) 
    : Math.max(2, Math.floor(Math.random() * 3) + 3);
  const intelligence = size >= 4 ? 6 : 4;

  return { size, speed, strength, defense, aggression, intelligence };
}

async function runImport() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB Atlas. Processing Trait_data.csv...");

  const seen = new Set();
  const operations = [];

  fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on('data', (row) => {
      // Clean binomial name: "Acinonyx_jubatus" -> "Acinonyx jubatus"
      const rawBinomial = row['Binomial.1.2'] || row.Binomial || row.scientific_name;
      if (!rawBinomial) return;

      const name = rawBinomial.replace(/_/g, ' ').trim();
      if (seen.has(name.toLowerCase())) return;
      seen.add(name.toLowerCase());

      const order = row['Order.1.2'] || row.Order || '';
      const family = row['Family.1.2'] || row.Family || '';
      const diet = inferDiet(order, family);
      const habitat = inferHabitat(row);

      // Mass conversion: PHYLACINE stores mass in grams (Mass.g)
      let massKg = 10;
      if (row['Mass.g'] && !isNaN(parseFloat(row['Mass.g']))) {
        massKg = Math.max(0.1, parseFloat(row['Mass.g']) / 1000);
      } else if (order.toLowerCase() === 'proboscidea') {
        massKg = 4000;
      } else if (order.toLowerCase() === 'carnivora') {
        massKg = 45;
      }

      // Check if prehistoric/extinct in Late Quaternary
      const isExtinct = row['IUCN.Status.1.2'] === 'EP';
      const timePeriod = isExtinct ? 'Pleistocene' : 'Quaternary (Cenozoic)';
      const startMya = isExtinct ? 2 : 0;

      const record = {
        name,
        animalClass: 'Mammalia',
        diet,
        habitat,
        era: 3, // Cenozoic
        timePeriod,
        startMya,
        massKg: Math.round(massKg * 10) / 10,
        imageUrl: null,
        description: `${name} is a mammalian specimen of the order ${order} and family ${family}. Adapted to ${habitat.toLowerCase()} environments with an estimated average body mass of ${Math.round(massKg)} kg.`,
        stats: computeStats(massKg, diet)
      };

      operations.push({
        updateOne: {
          filter: { name: record.name },
          update: { $set: record },
          upsert: true
        }
      });
    })
    .on('end', async () => {
      console.log(`Parsed ${operations.length} species from Trait_data.csv.`);

      // Import in chunks of 500 to keep network throughput high and avoid timeouts
      const CHUNK_SIZE = 500;
      let totalInserted = 0;
      let totalUpdated = 0;

      // Import the first 500 records to hit your archive size target cleanly
      const batch = operations.slice(0, 500);

      try {
        const result = await Animal.bulkWrite(batch, { ordered: false });
        totalInserted += result.upsertedCount;
        totalUpdated += result.modifiedCount;
        console.log(`Import complete: ${totalInserted} new specimens inserted, ${totalUpdated} existing updated.`);
      } catch (err) {
        console.error("Bulk write error:", err.message);
      }

      process.exit(0);
    });
}

runImport();