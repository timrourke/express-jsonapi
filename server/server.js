'use strict';

const express = require('express');
const Sequelize = require('sequelize');
const db = new Sequelize('mysql://dev:123456@mysql/jsonapi');

// Constants
const PORT = 3000;

// App
const app = express();
app.get('/', function (req, res) {
  res.send('Hello world\n');
});

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
