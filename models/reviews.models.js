const db = require('../db/connection');

exports.fetchReviewById = (reviewId) => {
  return db
    .query(
      `SELECT * FROM reviews 
       WHERE review_id = $1`,
      [reviewId]
    )
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

exports.fetchCommentsByReviewId = (reviewId) => {
  return db
    .query(
      `SELECT * FROM comments 
       WHERE review_id = $1 
       ORDER BY created_at DESC`,
      [reviewId]
    )
    .then((result) => {
      return result.rows;
    });
};

exports.createCommentOnReviewId = (reviewId, username, body) => {
  return db
    .query(
      `INSERT INTO comments( review_id, author, body) VALUES ($1, $2, $3) RETURNING *`,
      [reviewId, username, body]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.editReviewById = (reviewId, incVotes) => {
  return db
    .query(
      `UPDATE reviews 
    SET votes = votes + $1 WHERE review_id = $2 
    RETURNING *`,
      [incVotes, reviewId]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
