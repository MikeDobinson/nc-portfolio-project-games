const { getAllCategories } = require('./controllers/categories.controllers');
const {
  getReviewById,
  getAllReviews,
  getCommentsByReviewId,
  postCommentOnReviewId,
} = require('./controllers/reviews.controllers');
const {
  handlePsqlErrors,
  handleCustomErrors,
  handle500statuses,
  handleWrongFilepathErrors,
} = require('./controllers/errors.controllers');
const { deleteCommentById } = require('./controllers/comments.controllers');
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/categories', getAllCategories);
app.get('/api/reviews/:review_id', getReviewById);
app.get('/api/reviews', getAllReviews);
app.get('/api/reviews/:review_id/comments', getCommentsByReviewId);

app.post('/api/reviews/:review_id/comments', postCommentOnReviewId);

app.delete('/api/comments/:comment_id', deleteCommentById);

app.get('/*', handleWrongFilepathErrors);
app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handle500statuses);

module.exports = app;
