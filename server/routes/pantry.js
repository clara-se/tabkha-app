import express from 'express';
import mongoose from 'mongoose';
import { PantryItem } from '../models/PantryItem.js';

const pantryRouter = express.Router();
const UNITS = ['g', 'kg', 'ml', 'l', 'piece', 'tbsp', 'tsp'];

function checkAmount(req, res, next) {
  const { quantity, unit } = req.body;
  const badQuantity = quantity !== undefined && !(quantity > 0);
  const badUnit = unit !== undefined && !UNITS.includes(unit);
  if (badQuantity || badUnit) {
    return res.status(400).json({
      error: 'quantity must be above 0 and unit one of: '
        + UNITS.join(', '),
    });
  }
  next();
}

pantryRouter.get('/', async (req, res) => {
  res.json(await PantryItem.find({ userId: req.userId })
    .sort({ name: 1 }));
});

pantryRouter.post('/', checkAmount, async (req, res) => {
  try {
    const data = { ...req.body, userId: req.userId };
    res.status(201).json(await PantryItem.create(data));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

pantryRouter.patch('/:id', checkAmount, async (req, res) => {
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