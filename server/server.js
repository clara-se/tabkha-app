import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import authRouter from './routes/auth.js';
const dbUri = process.env.MONGODB_URI;
const port = Number(process.env.PORT) || 3000;
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// public
app.use('/api/auth', authRouter);

try {
  await mongoose.connect(dbUri);
  console.log('connected to MongoDB');
  app.listen(port);
} catch (err) {
  console.error('DB connection failed:', err.message);
  process.exit(1);
}