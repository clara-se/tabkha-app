import express from 'express';
const app = express();

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3000, () => console.log(
  'Listening on http://localhost:3000'));