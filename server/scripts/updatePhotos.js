require('dotenv').config();
const mongoose = require('mongoose');
const Animal = require('../src/models/Animal');

const IMGS = {
  'African Bush Elephant': 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=800&auto=format&fit=crop&q=80',
  'Bengal Tiger': 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&auto=format&fit=crop&q=80',
  'Blue Whale': 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=800&auto=format&fit=crop&q=80',
  'Dire Wolf': 'https://images.unsplash.com/photo-1564865878688-9a244444042a?w=800&auto=format&fit=crop&q=80',
  'Elasmotherium': 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=800&auto=format&fit=crop&q=80',
  'Glyptodon': 'https://images.unsplash.com/photo-1574063413132-355dbfd83e25?w=800&auto=format&fit=crop&q=80',
  'Gorilla': 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=800&auto=format&fit=crop&q=80',
  'Gray Wolf': 'https://images.unsplash.com/photo-1564865878688-9a244444042a?w=800&auto=format&fit=crop&q=80',
  'Great White Shark': 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=800&auto=format&fit=crop&q=80',
  'Grizzly Bear': 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&auto=format&fit=crop&q=80',
  'Harpy Eagle': 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=800&auto=format&fit=crop&q=80',
  'Hippopotamus': 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=800&auto=format&fit=crop&q=80',
  'Irish Elk': 'https://images.unsplash.com/photo-1484406566174-9da000fda645?w=800&auto=format&fit=crop&q=80',
  'Komodo Dragon': 'https://images.unsplash.com/photo-1606822350853-9799c9225792?w=800&auto=format&fit=crop&q=80',
  'Megalodon': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
  'Megatherium': 'https://images.unsplash.com/photo-1507667522163-3793b0870964?w=800&auto=format&fit=crop&q=80',
  'Orca': 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f7?w=800&auto=format&fit=crop&q=80',
  'Polar Bear': 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&auto=format&fit=crop&q=80',
  'Saltwater Crocodile': 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&auto=format&fit=crop&q=80',
  'Short-Faced Bear': 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&auto=format&fit=crop&q=80',
  'Smilodon': 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=800&auto=format&fit=crop&q=80',
  'Snow Leopard': 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=800&auto=format&fit=crop&q=80',
  'Titanoboa': 'https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=800&auto=format&fit=crop&q=80',
  'Woolly Mammoth': 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=800&auto=format&fit=crop&q=80'
};

async function updateImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');

    let count = 0;
    for (const [name, url] of Object.entries(IMGS)) {
      const res = await Animal.updateOne(
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { $set: { imageUrl: url } }
      );
      if (res.matchedCount > 0) {
        count++;
        console.log(`[+] Updated photo for: ${name}`);
      }
    }

    console.log(`\nSuccessfully applied photos to ${count} specimens!`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating images:', err.message);
    process.exit(1);
  }
}

updateImages();