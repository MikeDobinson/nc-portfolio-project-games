const { getAllCategories } = require('./controllers/categories.controllers');
const express = require('express');

const app = express();

app.use(express.json());

app.get('/api/categories', getAllCategories);

module.exports = app;
