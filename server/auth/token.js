import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

export function signToken(user) {
  return jwt.sign({ sub: user._id }, SECRET,
    { expiresIn: '1h' });
}

// throws if tampered with or expired
export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}