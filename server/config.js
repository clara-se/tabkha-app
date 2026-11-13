for (const key of ['MONGODB_URI', 'JWT_SECRET']) {
  if (!process.env[key]) {
    throw new Error(`Missing env var: ${key}`);
  }
}