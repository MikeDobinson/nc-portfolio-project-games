const { getAllCategories } = require('./controllers/categories.controllers');
const {
  getReviewById,
  getAllReviews,
  getCommentsByReviewId,
  postCommentOnReviewId,
  patchReviewOnId,
} = require('./controllers/reviews.controllers');
const {
  handlePsqlErrors,
  handleCustomErrors,
  handle500statuses,
  handleWrongFilepathErrors,
} = require('./controllers/errors.controllers');
const { deleteCommentById } = require('./controllers/comments.controllers');
const { getAllUsers } = require('./controllers/users.controllers');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

app.use(express.json());

app.get('/api/categories', getAllCategories);
app.get('/api/reviews/:review_id', getReviewById);
app.get('/api/reviews', getAllReviews);
app.get('/api/reviews/:review_id/comments', getCommentsByReviewId);
app.get('/api/users', getAllUsers);

app.post('/api/reviews/:review_id/comments', postCommentOnReviewId);

app.delete('/api/comments/:comment_id', deleteCommentById);

app.patch('/api/reviews/:review_id', patchReviewOnId);

app.get('/*', handleWrongFilepathErrors);
app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handle500statuses);

module.exports = app;
