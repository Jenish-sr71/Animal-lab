const Animal = require('../models/Animal');

// 1. READ ALL (With Search, Trait Filters, Sort, and Numbered Pagination)
exports.getAnimals = async (req, res) => {
  try {
    const {
      search,
      diet,
      habitat,
      era,
      sort = 'name_asc',
      limit = 24,
      page = 1,
    } = req.query;

    const filter = {};

    if (search && search.trim() !== '') {
      filter.name = { $regex: search.trim(),$options: 'i' };
    }
    if (diet && diet !== 'All' && diet !== 'All Diets') {
      filter.diet = { $regex: new RegExp(`^${diet}$`, 'i') };
    }
    if (habitat && habitat !== 'All' && habitat !== 'All Habitats') {
      filter.habitat = { $regex: new RegExp(habitat, 'i') };
    }
    if (era !== undefined && era !== '' && era !== 'All' && era !== 'All Eras') {
      filter.era = Number(era);
    }

    const sortMap = {
      name_desc: { name: -1 },
      mass_desc: { massKg: -1 },
      mass_asc: { massKg: 1 },
      mya_desc: { startMya: -1 },
      mya_asc: { startMya: 1 },
      strength_desc: { 'stats.strength': -1 },
      size_desc: { 'stats.size': -1 },
      name_asc: { name: 1 },
    };

    const sortOptions = sortMap[sort] || { name: 1 };
    const parsedLimit = Math.min(Number(limit) || 24, 100);
    const parsedPage = Math.max(Number(page) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const [animals, total] = await Promise.all([
      Animal.find(filter).sort(sortOptions).skip(skip).limit(parsedLimit),
      Animal.countDocuments(filter),
    ]);

    return res.status(200).json({
      animals,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit) || 1,
      limit: parsedLimit,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving specimens', error: error.message });
  }
};

// 2. READ ONE BY ID
exports.getAnimalById = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) {
      return res.status(404).json({ message: 'Specimen not found' });
    }
    return res.status(200).json(animal);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving specimen', error: error.message });
  }
};

// 3. CREATE SPECIMEN (POST /animals)
exports.createAnimal = async (req, res) => {
  try {
    const { name, animalClass, diet, habitat, era, timePeriod, startMya, massKg, imageUrl, description, stats } = req.body;

    const existing = await Animal.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      return res.status(409).json({ message: 'A specimen with this name already exists' });
    }

    const newAnimal = new Animal({
      name: name.trim(),
      animalClass,
      diet,
      habitat,
      era: Number(era) || 0,
      timePeriod,
      startMya: Number(startMya) || 0,
      massKg: Number(massKg) || 0,
      imageUrl: imageUrl || null,
      description,
      stats,
    });

    const savedAnimal = await newAnimal.save();
    return res.status(201).json(savedAnimal);
  } catch (error) {
    return res.status(400).json({ message: 'Failed to create specimen', error: error.message });
  }
};

// 4. UPDATE SPECIMEN (PUT /animals/:id)
exports.updateAnimal = async (req, res) => {
  try {
    const updatedAnimal = await Animal.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedAnimal) {
      return res.status(404).json({ message: 'Specimen not found' });
    }

    return res.status(200).json(updatedAnimal);
  } catch (error) {
    return res.status(400).json({ message: 'Failed to update specimen', error: error.message });
  }
};

// 5. DELETE SPECIMEN (DELETE /animals/:id)
exports.deleteAnimal = async (req, res) => {
  try {
    const deletedAnimal = await Animal.findByIdAndDelete(req.params.id);
    if (!deletedAnimal) {
      return res.status(404).json({ message: 'Specimen not found' });
    }
    return res.status(200).json({ message: `Specimen "${deletedAnimal.name}" deleted successfully` });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete specimen', error: error.message });
  }
};