require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Animal = require('../src/models/Animal');

const WIKI_HEADERS = {
  'User-Agent': 'WildlifeArchiveBot/2.0 (Academic Research Project; Node.js)'
};

async function fetchWikiImage(animalName) {
  try {
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(animalName)}`;
    const res = await axios.get(summaryUrl, { headers: WIKI_HEADERS, timeout: 5000 });
    return res.data.thumbnail?.source || res.data.originalimage?.source || null;
  } catch (err) {
    // If exact name fails, try Wikipedia OpenSearch
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(animalName)}&limit=1&namespace=0&format=json`;
      const searchRes = await axios.get(searchUrl, { headers: WIKI_HEADERS, timeout: 5000 });
      const resolvedTitle = searchRes.data[1]?.[0];
      if (resolvedTitle && resolvedTitle.toLowerCase() !== animalName.toLowerCase()) {
        return await fetchWikiImage(resolvedTitle);
      }
    } catch {
      return null;
    }
    return null;
  }
}

async function populateImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');

    // Find all specimens missing an image
    const missing = await Animal.find({
      $or: [{ imageUrl: null }, { imageUrl: '' }, { imageUrl: {$exists: false } }]
    });

    console.log(`Found ${missing.length} specimens without images.`);

    let updatedCount = 0;
    for (const specimen of missing) {
      const img = await fetchWikiImage(specimen.name);
      if (img) {
        await Animal.findByIdAndUpdate(specimen._id, { imageUrl: img });
        updatedCount++;
        console.log(`[+] Added image for: ${specimen.name}`);
      } else {
        console.log(`[-] No image found for: ${specimen.name}`);
      }

      // Small delay to respect Wikimedia rate limits
      await new Promise((r) => setTimeout(r, 200));
    }

    console.log(`Finished! Updated ${updatedCount} specimens.`);
    process.exit(0);
  } catch (error) {
    console.error('Error populating images:', error.message);
    process.exit(1);
  }
}

populateImages();