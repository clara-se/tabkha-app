import express from 'express';
import mongoose from 'mongoose';
import { Recipe } from '../models/Recipe.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { PantryItem } from '../models/PantryItem.js';

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
  imageUrl: z.string().trim().max(500)
    .refine((v) => v === '' || /^https?:\/\//i.test(v),
      'Image link must start with http:// or https://')
    .optional(),
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

recipesRouter.get('/:id/cook', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const recipe = await Recipe.findOne({ _id: id, userId: req.userId });
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

  const pantry = await PantryItem.find({ userId: req.userId });
  const norm = (s) => s.trim().toLowerCase();

  const ingredients = recipe.ingredients.map((ing) => {
    const matches = pantry.filter((p) => norm(p.name) === norm(ing.name));
    const sameUnit = matches.filter((p) => p.unit === ing.unit);
    let status;
    let have = 0;
    if (matches.length === 0) {
      status = 'missing';
    } else if (sameUnit.length === 0) {
      status = 'check units';
    } else {
      have = sameUnit.reduce((sum, p) => sum + p.quantity, 0);
      status = have >= ing.quantity ? 'enough' : 'not enough';
    }
    return {
      name: ing.name,
      needed: ing.quantity,
      unit: ing.unit,
      have,
      status,
      pantry: matches.map((p) => `${p.quantity} ${p.unit}`),
    };
  });

  const canCook =
    ingredients.length > 0 && ingredients.every((i) => i.status === 'enough');
  res.json({ canCook, ingredients });
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