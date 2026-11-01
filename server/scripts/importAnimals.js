const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const csv = require('csv-parser');
const Animal = require('../src/models/Animal');

dotenv.config();

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Animal.deleteMany();

    const animals = [];
    fs.createReadStream('./data/animals_enriched.csv')
      .pipe(csv())
      .on('data', (row) => {
        animals.push({
          name: row.name,
          slug: row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          era: Number(row.era),
          type: row.type,
          animalClass: row.animal_class,
          habitat: row.habitat,
          timePeriod: row.time_period,
          diet: row.diet,
          massKg: Number(row.mass_kg),
          startMya: Number(row.start_mya),
          stats: {
            size: Number(row.size),
            speed: Number(row.speed),
            strength: Number(row.strength),
            defense: Number(row.defense),
            aggression: Number(row.aggression),
            intelligence: Number(row.intelligence)
          },
          description: row.description,
          sourceUrl: row.sourceUrl,
          imageUrl: row.imageUrl,
          imageCredit: row.imageCredit,
          imageLicense: row.imageLicense,
          imagePage: row.imagePage
        });
      })
      .on('end', async () => {
        await Animal.insertMany(animals);
        console.log('Data Imported!');
        process.exit();
      });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importData();