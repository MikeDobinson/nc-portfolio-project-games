const { getAllCategories } = require('./controllers/categories.controllers');
const express = require('express');

const app = express();

app.use(express.json());

app.get('/api/categories', getAllCategories);

app.get('/*', (req, res) => {
  res.status(404).send({ msg: 'Invalid URL' });
});

module.exports = app;
