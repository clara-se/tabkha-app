import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRouter from './routes/auth.js';
import recipesRouter from './routes/recipes.js';
import pantryRouter from './routes/pantry.js';
import { requireAuth } from './middleware/requireAuth.js';
const dbUri = process.env.MONGODB_URI;
const port = Number(process.env.PORT) || 3000;
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// public
app.use('/api/auth', authRouter);
// locked
app.use('/api/recipes', requireAuth);
app.use('/api/recipes', recipesRouter);
app.use('/api/pantry', requireAuth);
app.use('/api/pantry', pantryRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

try {
  await mongoose.connect(dbUri);
  console.log('connected to MongoDB');
  app.listen(port);
} catch (err) {
  console.error('DB connection failed:', err.message);
  process.exit(1);
}