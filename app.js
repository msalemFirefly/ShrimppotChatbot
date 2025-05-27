// app.js
const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const indexRouter = require('./routes/index');
app.use('/', indexRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;