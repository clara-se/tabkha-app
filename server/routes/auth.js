import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { signToken } from '../auth/token.js';

const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Email and 8+ char password' });
  }
  if (await User.findOne({ email })) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash });
  res.status(201).json({
    token: signToken(user),
    user: { id: user._id, email: user.email },
  });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const ok = user &&
    await bcrypt.compare(password, user.passwordHash);
  const error = 'Invalid email or password';
  if (!ok) return res.status(401).json({ error });
  res.json({ token: signToken(user) });
});

export default authRouter;