const {
  removeCommentById,
  checkCommentExists,
} = require('../models/comments.models');

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;

  checkCommentExists(comment_id)
    .then(() => {
      return removeCommentById(comment_id);
    })
    .then((result) => {
      res.status(204).send({});
    })
    .catch((err) => {
      next(err);
    });
};
