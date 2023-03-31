const db = require('../db/connection');

exports.checkCommentExists = (commentId) => {
  return db
    .query(`SELECT * FROM comments WHERE comment_id = ($1)`, [commentId])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({
          status: 404,
          msg: 'No comment found with that ID',
        });
      }
    });
};

exports.removeCommentById = (commentId) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = ($1) `, [commentId])
    .then(({ rows }) => rows);
};
