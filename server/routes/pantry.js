import express from 'express';
import mongoose from 'mongoose';
import { PantryItem } from '../models/PantryItem.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

const pantryRouter = express.Router();
const UNITS = ['g', 'kg', 'ml', 'l', 'piece', 'tbsp', 'tsp'];

const PantryInput = z.object({
  name: z.string().trim().min(1).max(100),
  quantity: z.number().positive(),
  unit: z.enum(UNITS),
});
pantryRouter.get('/', async (req, res) => {
  res.json(await PantryItem.find({ userId: req.userId })
    .sort({ name: 1 }));
});

pantryRouter.post('/', validate(PantryInput), async (req, res) => {
  try {
    const data = { ...req.body, userId: req.userId };
    res.status(201).json(await PantryItem.create(data));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

pantryRouter.patch('/:id', validate(PantryInput.partial()), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  try {
    const filter = { _id: id, userId: req.userId };
    const data = { ...req.body, userId: req.userId };
    const item = await PantryItem.findOneAndUpdate(filter, data,
      { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

pantryRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const filter = { _id: id, userId: req.userId };
  const item = await PantryItem.findOneAndDelete(filter);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.status(204).end();
});

export default pantryRouter;