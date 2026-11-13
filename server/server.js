import 'dotenv/config';
import './config.js';
import mongoose from 'mongoose';
import app from './app.js';

const dbUri = process.env.MONGODB_URI;
const port = Number(process.env.PORT) || 3000;

try {
  await mongoose.connect(dbUri);
  console.log('connected to MongoDB');
  app.listen(port);
} catch (err) {
  console.error('DB connection failed:', err.message);
  process.exit(1);
}