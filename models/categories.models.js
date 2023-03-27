const db = require('../db/connection');

exports.fetchAllCategories = () => {
  return db.query('SELECT * FROM categories;').then((result) => {
    return result.rows;
  });
};
