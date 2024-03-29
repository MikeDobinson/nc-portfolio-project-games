const db = require('../db/connection');

exports.fetchReviewById = (reviewId) => {
  return db
    .query(
      `SELECT reviews.* , COUNT(comments.review_id) AS comment_count 
  FROM 
  reviews
  LEFT JOIN comments ON reviews.review_id = comments.review_id 
  WHERE 
  reviews.review_id = $1
  GROUP BY reviews.review_id;
`,
      [reviewId]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({
          status: 404,
          msg: 'No review found with that ID',
        });
      }
      return rows[0];
    });
};

exports.fetchAllReviews = (
  category,
  order = 'DESC',
  sort_by = 'created_at'
) => {
  const queryParameters = [];
  if (!['ASC', 'DESC'].includes(order)) {
    return Promise.reject({ status: 400, msg: 'Invalid query' });
  }

  if (
    ![
      'category',
      'created_at',
      'designer',
      'owner',
      'review_id',
      'review_img_url',
      'title',
      'votes',
      'comment_count',
    ].includes(sort_by)
  ) {
    return Promise.reject({ status: 400, msg: 'Bad sort query' });
  }

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
  ORDER BY ${sort_by} ${order}`;

  return db.query(fetchAllReviewsSQL, queryParameters).then(({ rows }) => {
    if (!rows.length) {
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
       WHERE review_id = $1
       ORDER BY created_at DESC`,
      [reviewId]
    )
    .then((result) => {
      const { rows } = result;

      return rows;
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
