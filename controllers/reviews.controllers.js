const {
  fetchReviewById,
  fetchAllReviews,
  fetchCommentsByReviewId,
  createCommentOnReviewId,
  editReviewById,
} = require('../models/reviews.models');

exports.getReviewById = (req, res, next) => {
  const { review_id } = req.params;

  fetchReviewById(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch((err) => next(err));
};

exports.getAllReviews = (req, res, next) => {
  const { category } = req.query;
  fetchAllReviews(category)
    .then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCommentsByReviewId = (req, res, next) => {
  const { review_id } = req.params;
  fetchReviewById(review_id)
    .then(() => {
      return fetchCommentsByReviewId(review_id);
    })
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCommentOnReviewId = (req, res, next) => {
  const { review_id } = req.params;
  const { username, body } = req.body;

  fetchReviewById(review_id)
    .then(() => {
      return createCommentOnReviewId(review_id, username, body);
    })
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchReviewOnId = (req, res, next) => {
  const { review_id } = req.params;
  const { inc_votes } = req.body;
  fetchReviewById(review_id)
    .then(() => {
      return editReviewById(review_id, inc_votes);
    })
    .then((updatedReview) => {
      res.status(200).send({ updatedReview });
    })
    .catch((err) => {
      next(err);
    });
};
