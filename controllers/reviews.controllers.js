const { fetchReview } = require('../models/reviews.models');

exports.getReview = (req, res) => {
  const { review_id } = req.params;

  fetchReview(review_id).then((review) => {
    console.log(review);
    res.status(200).send({ review });
  });
};
