import express from 'express';

const app = express();

const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Bienvenue sur mon serveur Express !');
});

app.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});