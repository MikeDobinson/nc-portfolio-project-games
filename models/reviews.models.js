const db = require('../db/connection');

exports.fetchReview = (reviewID) => {
  return db
    .query(`SELECT * FROM reviews WHERE review_id = $1`, [reviewID])
    .then((result) => {
      return result.rows[0];
    });
};
