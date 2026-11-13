import express from 'express';
import mongoose from 'mongoose';
import { Recipe } from '../models/Recipe.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

const recipesRouter = express.Router();
const UNITS = ['g', 'kg', 'ml', 'l', 'piece', 'tbsp', 'tsp'];

const Ingredient = z.object({
  name: z.string().trim().min(1).max(100),
  quantity: z.number().positive(),
  unit: z.enum(UNITS),
});
const RecipeInput = z.object({
  title: z.string().trim().min(1).max(120),
  sourceUrl: z.string().trim().max(500).optional(),
  ingredients: z.array(Ingredient).max(100).optional(),
  steps: z.string().max(10000).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
});

recipesRouter.get('/', async (req, res) => {
  try {
    const search = z.string().max(100).parse(req.query.search ?? '');
    const re = mongoose.trusted({ $regex: search, $options: 'i' });
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

recipesRouter.post('/', validate(RecipeInput), async (req, res) => {
  try {
    const data = { ...req.body, userId: req.userId };
    res.status(201).json(await Recipe.create(data));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

recipesRouter.patch('/:id', validate(RecipeInput.partial()), async (req, res) => {
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