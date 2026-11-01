require('dotenv').config();
const mongoose = require('mongoose');
const Animal = require('../src/models/Animal');

// Scaled combat stats (1-10) based on real mass, diet, and predatory behaviors
function computeStats(massKg, diet, isApex = false) {
  const safeMass = massKg > 0 ? massKg : 50;
  const size = Math.min(10, Math.max(1, Math.round(Math.log10(safeMass) * 2.1)));
  const strength = Math.min(10, Math.max(1, Math.round(size * 0.9 + (diet === 'Carnivore' ? 1 : 0))));
  const speed = Math.max(2, Math.min(10, 11 - Math.round(size * 0.65)));
  const defense = Math.min(10, Math.max(1, Math.round(size * 0.7 + (isApex ? 1 : 0))));
  const aggression = diet === 'Carnivore' ? (isApex ? 10 : 8) : 4;
  const intelligence = isApex ? 8 : 6;
  return { size, speed, strength, defense, aggression, intelligence };
}

const cenozoicBestiary = [
  // ==========================================
  // --- ICE AGE & CENOZOIC MEGAFAUNA ---
  // ==========================================
  {
    name: 'Woolly Mammoth',
    animalClass: 'Mammalia',
    diet: 'Herbivore',
    habitat: 'Terrestrial',
    era: 3,
    timePeriod: 'Pleistocene',
    startMya: 2,
    massKg: 6000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Mammuthus_primigenius_life_restoration.png/640px-Mammuthus_primigenius_life_restoration.png',
    description: 'An iconic Ice Age proboscidean blanketed in thick fur with long curved tusks adapted for digging beneath permafrost[cite: 20].',
    stats: computeStats(6000, 'Herbivore', false)
  },
  {
    name: 'Smilodon',
    animalClass: 'Mammalia',
    diet: 'Carnivore',
    habitat: 'Terrestrial',
    era: 3,
    timePeriod: 'Pleistocene',
    startMya: 2,
    massKg: 300,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Smilodon_fatalis_restoration.jpg/640px-Smilodon_fatalis_restoration.jpg',
    description: 'The famous saber-toothed cat armed with precision 28cm blade canines designed to ambush and pin large prey[cite: 20].',
    stats: computeStats(300, 'Carnivore', true)
  },
  {
    name: 'Megalodon',
    animalClass: 'Chondrichthyes',
    diet: 'Carnivore',
    habitat: 'Marine',
    era: 3,
    timePeriod: 'Miocene',
    startMya: 15,
    massKg: 50000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Carcharocles_megalodon_life_restoration.png/640px-Carcharocles_megalodon_life_restoration.png',
    description: 'The largest macropredatory shark to swim the oceans, wielding serrated triangular teeth over 7 inches long[cite: 18, 20].',
    stats: computeStats(50000, 'Carnivore', true)
  },
  {
    name: 'Megatherium',
    animalClass: 'Mammalia',
    diet: 'Herbivore',
    habitat: 'Terrestrial',
    era: 3,
    timePeriod: 'Pleistocene',
    startMya: 2,
    massKg: 4000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Megatherium_americanum_restoration.png/640px-Megatherium_americanum_restoration.png',
    description: 'An elephant-sized giant ground sloth capable of standing bipedally with massive curved foreclaws[cite: 20].',
    stats: computeStats(4000, 'Herbivore', false)
  },
  {
    name: 'Titanoboa',
    animalClass: 'Reptilia',
    diet: 'Carnivore',
    habitat: 'Freshwater',
    era: 3,
    timePeriod: 'Paleocene',
    startMya: 60,
    massKg: 1135,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Titanoboa_cerrejonensis.jpg/640px-Titanoboa_cerrejonensis.jpg',
    description: 'A 13-meter prehistoric super-constrictor that ruled riverways and swamps shortly following the extinction of the dinosaurs[cite: 18].',
    stats: computeStats(1135, 'Carnivore', true)
  },
  {
    name: 'Dire Wolf',
    animalClass: 'Mammalia',
    diet: 'Carnivore',
    habitat: 'Terrestrial',
    era: 3,
    timePeriod: 'Pleistocene',
    startMya: 1,
    massKg: 75,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Aenocyon_dirus_life_restoration.png/640px-Aenocyon_dirus_life_restoration.png',
    description: 'A robust pack hunter with heavier bone structure and higher bite pressure than the modern gray wolf[cite: 20].',
    stats: computeStats(75, 'Carnivore', true)
  },
  {
    name: 'Glyptodon',
    animalClass: 'Mammalia',
    diet: 'Herbivore',
    habitat: 'Terrestrial',
    era: 3,
    timePeriod: 'Pleistocene',
    startMya: 2,
    massKg: 2000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Glyptodon_reticulatus_restoration.png/640px-Glyptodon_reticulatus_restoration.png',
    description: 'A car-sized relative of the armadillo protected by an impenetrable carapace of fused osteoderms.',
    stats: computeStats(2000, 'Herbivore', false)
  },
  {
    name: 'Elasmotherium',
    animalClass: 'Mammalia',
    diet: 'Herbivore',
    habitat: 'Terrestrial',
    era: 3,
    timePeriod: 'Pleistocene',
    startMya: 2,
    massKg: 4500,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Elasmotherium_sibiricum_life_restoration.png/640px-Elasmotherium_sibiricum_life_restoration.png',
    description: 'Known as the Siberian Unicorn, a colossal rhinoceros carrying an immense single horn anchored on its forehead[cite: 20].',
    stats: computeStats(4500, 'Herbivore', false)
  },
  {
    name: 'Irish Elk',
    animalClass: 'Mammalia',
    diet: 'Herbivore',
    habitat: 'Terrestrial',
    era: 3,
    timePeriod: 'Pleistocene',
    startMya: 1,
    massKg: 700,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Megaloceros_giganteus_restoration.png/640px-Megaloceros_giganteus_restoration.png',
    description: 'The giant deer possessing the largest antlers known to have evolved on any cervid, spanning up to 3.6 meters[cite: 20].',
    stats: computeStats(700, 'Herbivore', false)
  },
  {
    name: 'Short-Faced Bear',
    animalClass: 'Mammalia',
    diet: 'Carnivore',
    habitat: 'Terrestrial',
    era: 3,
    timePeriod: 'Pleistocene',
    startMya: 1,
    massKg: 900,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Arctodus_simus_life_restoration.png/640px-Arctodus_simus_life_restoration.png',
    description: 'One of the largest terrestrial mammalian carnivores, possessing elongated limbs built for high sustained pursuit speeds.',
    stats: computeStats(900, 'Carnivore', true)
  },

  // ==========================================
  // --- MODERN APEX PREDATORS & WILDLIFE ---
  // ==========================================
  {
    name: 'Bengal Tiger',
    animalClass: 'Mammalia',
    diet: 'Carnivore',
    habitat: 'Terrestrial',
    era: 3,
    timePeriod: 'Holocene (Modern)',
    startMya: 0,
    massKg: 220,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Tiger_in_Ranthambhore.jpg/640px-Tiger_in_Ranthambhore.jpg',
    description: 'The preeminent apex pantherine felid, known for stealth, swimming proficiency, and bone-shattering bite force[cite: 23].',
    stats: computeStats(220, 'Carnivore', true)
  },
  {
    name: 'African Bush Elephant',
    animalClass: 'Mammalia',
    diet: 'Herbivore',
    habitat: 'Terrestrial',
    era: 3,
    timePeriod: 'Holocene (Modern)',
    startMya: 0,
    massKg: 6000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/African_Bush_Elephant.jpg/640px-African_Bush_Elephant.jpg',
    description: 'The largest living land animal, possessing high intelligence, an articulated trunk, and imposing ivory tusks[cite: 18].',
    stats: computeStats(6000, 'Herbivore', false)
  },
  {
    name: 'Blue Whale',
    animalClass: 'Mammalia',
    diet: 'Carnivore',
    habitat: 'Marine',
    era: 3,
    timePeriod: 'Holocene (Modern)',
    startMya: 0,
    massKg: 150000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Anim1754_-_Flickr_-_NOAA_Photo_Library.jpg/640px-Anim1754_-_Flickr_-_NOAA_Photo_Library.jpg',
    description: 'The most massive creature known to have lived on Earth, filtering tons of krill daily through baleen plates[cite: 23].',
    stats: computeStats(150000, 'Carnivore', false)
  },
  {
    name: 'Orca',
    animalClass: 'Mammalia',
    diet: 'Carnivore',
    habitat: 'Marine',
    era: 3,
    timePeriod: 'Holocene (Modern)',
    startMya: 0,
    massKg: 5500,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Killerwhales_jumping.jpg/640px-Killerwhales_jumping.jpg',
    description: 'The ocean’s apex toothed predator, deploying coordinated pod tactics to hunt seals, sharks, and baleen whales.',
    stats: computeStats(5500, 'Carnivore', true)
  },
  {
    name: 'Saltwater Crocodile',
    animalClass: 'Reptilia',
    diet: 'Carnivore',
    habitat: 'Marine',
    era: 3,
    timePeriod: 'Holocene (Modern)',
    startMya: 0,
    massKg: 1000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Saltwater_Crocodile_%28Crocodylus_porosus%29.jpg/640px-Saltwater_Crocodile_%28Crocodylus_porosus%29.jpg',
    description: 'The largest living reptile on Earth, executing the devastating death roll with the strongest measured bite force[cite: 23].',
    stats: computeStats(1000, 'Carnivore', true)
  },
  {
    name: 'Polar Bear',
    animalClass: 'Mammalia',
    diet: 'Carnivore',
    habitat: 'Terrestrial',
    era: 3,
    timePeriod: 'Holocene (Modern)',
    startMya: 0,
    massKg: 500,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Polar_Bear_-_Alaska_%28cropped%29.jpg/640px-Polar_Bear_-_Alaska_%28cropped%29.jpg',
    description: 'A hypercarnivorous Arctic bear insulated with dense blubber, capable of swimming across maritime ice floes.',
    stats: computeStats(500, 'Carnivore', true)
  },
  {
    name: 'Grizzly Bear',
    animalClass: 'Mammalia',
    diet: 'Omnivore',
    habitat: 'Terrestrial',
    era: 3,
    timePeriod: 'Holocene (Modern)',
    startMya: 0,
    massKg: 360,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Grizzly_Bear_sitting.jpg/640px-Grizzly_Bear_sitting.jpg',
    description: 'A heavily built North American brown bear subspecies with strong muscular shoulder humps and claws for digging[cite: 23].',
    stats: computeStats(360, 'Omnivore', false)
  },
  {
    name: 'Great White Shark',
    animalClass: 'Chondrichthyes',
    diet: 'Carnivore',
    habitat: 'Marine',
    era: 3,
    timePeriod: 'Holocene (Modern)',
    startMya: 0,
    massKg: 1900,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/White_shark.jpg/640px-White_shark.jpg',
    description: 'A pelagic apex predator utilizing Lorenzini ampullae electroreception and rows of razor serrations[cite: 23].',
    stats: computeStats(1900, 'Carnivore', true)
  },
  {
    name: 'Komodo Dragon',
    animalClass: 'Reptilia',
    diet: 'Carnivore',
    habitat: 'Terrestrial',
    era: 3,
    timePeriod: 'Holocene (Modern)',
    startMya: 0,
    massKg: 90,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Komodo_dragon_eating.jpg/640px-Komodo_dragon_eating.jpg',
    description: 'The heaviest living lizard, hunting through ambush, serrated curved teeth, and anticoagulant venom[cite: 23].',
    stats: computeStats(90, 'Carnivore', true)
  },
  {
    name: 'Harpy Eagle',
    animalClass: 'Aves',
    diet: 'Carnivore',
    habitat: 'Aerial',
    era: 3,
    timePeriod: 'Holocene (Modern)',
    startMya: 0,
    massKg: 9,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Harpia_harpyja_01128.jpg/640px-Harpia_harpyja_01128.jpg',
    description: 'The most powerful rainforest raptor, using talons that match the size of grizzly claws to snatch sloths and monkeys.',
    stats: computeStats(9, 'Carnivore', true)
  },
  {
    name: 'Gray Wolf',
    animalClass: 'Mammalia',
    diet: 'Carnivore',
    habitat: 'Terrestrial',
    era: 3,
    timePeriod: 'Holocene (Modern)',
    startMya: 0,
    massKg: 45,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Eurasian_wolf_2.jpg/640px-Eurasian_wolf_2.jpg',
    description: 'A social apex predator operating in structured packs, exhausting prey across wide terrains through endurance running.',
    stats: computeStats(45, 'Carnivore', false)
  },
  {
    name: 'Gorilla',
    animalClass: 'Mammalia',
    diet: 'Herbivore',
    habitat: 'Terrestrial',
    era: 3,
    timePeriod: 'Holocene (Modern)',
    startMya: 0,
    massKg: 180,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Gorilla_gorilla_gorilla12.jpg/640px-Gorilla_gorilla_gorilla12.jpg',
    description: 'The largest living primate, possessing immense muscular upper-body leverage and high social intelligence.',
    stats: computeStats(180, 'Herbivore', false)
  },
  {
    name: 'Snow Leopard',
    animalClass: 'Mammalia',
    diet: 'Carnivore',
    habitat: 'Terrestrial',
    era: 3,
    timePeriod: 'Holocene (Modern)',
    startMya: 0,
    massKg: 55,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Snow_leopard_portrait.jpg/640px-Snow_leopard_portrait.jpg',
    description: 'The solitary ghost cat of the Central Asian crags, camouflaged for steep rocky ridges and cold alpine temperatures.',
    stats: computeStats(55, 'Carnivore', true)
  },
  {
    name: 'Hippopotamus',
    animalClass: 'Mammalia',
    diet: 'Herbivore',
    habitat: 'Freshwater',
    era: 3,
    timePeriod: 'Holocene (Modern)',
    startMya: 0,
    massKg: 1500,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Portrait_Hippopotamus_in_the_water.jpg/640px-Portrait_Hippopotamus_in_the_water.jpg',
    description: 'A territorial semiaquatic heavyweight armed with massive ivory canines and aggressive river defenses.',
    stats: computeStats(1500, 'Herbivore', false)
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');

    // Remove older dinosaurs and obscure entries
    await Animal.deleteMany({});
    console.log('All previous species removed.');

    await Animal.insertMany(cenozoicBestiary);
    console.log(`Successfully seeded ${cenozoicBestiary.length} Cenozoic megafauna and modern apex specimens!`);
    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err.message);
    process.exit(1);
  }
}

seed();