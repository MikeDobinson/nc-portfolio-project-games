const db = require('../db/connection');

exports.fetchReview = (reviewID) => {
  return db
    .query(`SELECT * FROM reviews WHERE review_id = $1`, [reviewID])
    .then((result) => {
      if (!result.rows.length) {
        return Promise.reject({
          msg: 'No review found with that ID',
          status: 404,
        });
      }
      return result.rows[0];
    });
};
