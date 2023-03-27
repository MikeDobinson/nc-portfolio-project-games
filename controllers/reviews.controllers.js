const { fetchReview } = require('../models/reviews.models');

exports.getReview = (req, res) => {
  const { review_id } = req.params;

  fetchReview(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      if (err.status === 404) {
        res.status(404).send({ msg: err.msg });
      } else {
        res.status(400).send({ msg: 'Invalid request' });
      }
    });
};
