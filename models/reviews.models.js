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

exports.fetchAllReviews = (category) => {
  const queryParameters = [];
  let fetchAllReviewsSQL = `
  SELECT 
    reviews.category, reviews.created_at, 
    reviews.designer, reviews.owner, 
    reviews.review_id, reviews.review_img_url, 
    reviews.title, reviews.votes, 
    CAST(COUNT(comments.review_id) AS INT) AS comment_count
  FROM 
    reviews 
  LEFT JOIN comments ON reviews.review_id=comments.review_id
  `;

  if (category) {
    fetchAllReviewsSQL += ` 
    WHERE reviews.category = $1 `;
    queryParameters.push(category);
  }

  fetchAllReviewsSQL += `GROUP BY reviews.review_id 
  ORDER BY created_at DESC`;

  return db.query(fetchAllReviewsSQL, queryParameters).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: 'Reviews not found' });
    } else {
      return rows;
    }
  });
};

exports.fetchCommentsByReviewId = (reviewId) => {
  return db
    .query(
      `SELECT * FROM comments 
       WHERE review_id = ($1) 
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
