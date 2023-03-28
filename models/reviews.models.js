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

exports.fetchAllReviews = () => {
  return db
    .query(
      `SELECT owner, title, reviews.review_id, category, review_img_url, reviews.created_at, reviews.votes, designer, CAST(COUNT(comments) AS INT) AS comment_count 
      FROM reviews 
      LEFT JOIN comments ON reviews.review_id = comments.review_id 
      GROUP BY reviews.review_id 
      ORDER BY created_at DESC;`
    )
    .then((result) => {
      return result.rows;
    });
};
