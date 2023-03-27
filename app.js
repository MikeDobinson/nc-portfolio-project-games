const { getAllCategories } = require('./controllers/categories.controllers');
const { getReview } = require('./controllers/reviews.controllers');
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/categories', getAllCategories);
app.get('/api/reviews/:review_id', getReview);

app.get('/*', (req, res) => {
  res.status(404).send({ msg: 'Invalid URL' });
});

app.use((err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).send({ msg: err.msg });
  } else {
    res.status(400).send({ msg: 'Invalid request' });
  }
});

module.exports = app;
