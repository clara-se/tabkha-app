import express from 'express';
import mongoose from 'mongoose';
import { Recipe } from '../models/Recipe.js';

const recipesRouter = express.Router();
const UNITS = ['g', 'kg', 'ml', 'l', 'piece', 'tbsp', 'tsp'];

function checkIngredients(req, res, next) {
  const { ingredients } = req.body;
  if (ingredients === undefined) return next();
  const ok = Array.isArray(ingredients) && ingredients.every(
    (i) => i?.quantity > 0 && UNITS.includes(i?.unit));
  if (!ok) {
    return res.status(400).json({
      error: 'Each ingredient needs a quantity above 0 and a unit: '
        + UNITS.join(', '),
    });
  }
  next();
}

recipesRouter.get('/', async (req, res) => {
  try {
    const re = { $regex: req.query.search ?? '', $options: 'i' };
    res.json(await Recipe.find({ userId: req.userId, title: re })
      .sort({ createdAt: -1 }));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

recipesRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const recipe = await Recipe.findOne({ _id: id, userId: req.userId });
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
  res.json(recipe);
});

recipesRouter.post('/', checkIngredients, async (req, res) => {
  try {
    const data = { ...req.body, userId: req.userId };
    res.status(201).json(await Recipe.create(data));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

recipesRouter.patch('/:id', checkIngredients, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  try {
    const filter = { _id: id, userId: req.userId };
    const data = { ...req.body, userId: req.userId };
    const recipe = await Recipe.findOneAndUpdate(filter, data,
      { new: true, runValidators: true });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

recipesRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const filter = { _id: id, userId: req.userId };
  const recipe = await Recipe.findOneAndDelete(filter);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
  res.status(204).end();
});

export default recipesRouter;