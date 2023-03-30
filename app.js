const { getAllCategories } = require('./controllers/categories.controllers');
const {
  getReviewById,
  getAllReviews,
  getCommentsByReviewId,
} = require('./controllers/reviews.controllers');
const {
  handlePsqlErrors,
  handleCustomErrors,
  handle500statuses,
  handleWrongFilepathErrors,
} = require('./controllers/errors.controllers');
const express = require('express');
const app = express();

app.get('/api/categories', getAllCategories);
app.get('/api/reviews/:review_id', getReviewById);
app.get('/api/reviews', getAllReviews);
app.get('/api/reviews/:review_id/comments', getCommentsByReviewId);

app.get('/*', handleWrongFilepathErrors);
app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handle500statuses);

module.exports = app;
