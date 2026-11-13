import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth.js';
import recipesRouter from './routes/recipes.js';
import pantryRouter from './routes/pantry.js';
import { requireAuth } from './middleware/requireAuth.js';

mongoose.set('sanitizeFilter', true);

const apiLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 300 });
const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 5,
  message: { error: 'Too many attempts. Try again later.' },
});

const app = express();
app.use(helmet());
app.set('trust proxy', 1);
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json({ limit: '10kb' }));
app.use('/api', apiLimiter);
app.use('/api/auth/login', loginLimiter);

app.get('/', (req, res) => { res.json({ status: 'ok' }); });

// public
app.use('/api/auth', authRouter);
// locked
app.use('/api/recipes', requireAuth);
app.use('/api/recipes', recipesRouter);
app.use('/api/pantry', requireAuth);
app.use('/api/pantry', pantryRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

export default app;