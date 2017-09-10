'use strict';

import express = require('express');
import bodyParser = require('body-parser');
import methodOverride = require('method-override');
import compression = require('compression');
import helmet = require('helmet');
import initSequelize from './db/init-sequelize';

const db = initSequelize();
import { defineModels } from './models/models';
const models = defineModels(db);

import Application from './Application';

const modelDefs = [];

Object.keys(models).forEach((key) => modelDefs.push(models[key]));

const myApp = new Application(express(), db, modelDefs);

myApp.configureMiddlewares([
  helmet(),
  bodyParser.urlencoded({
    extended: true,
  }),
  bodyParser.json({
    type: 'application/vnd.api+json',
  }),
  methodOverride(),
  compression(),
]);

myApp.serve(3000);

// Export the application instance for testing
export default {
  app: myApp.getExpressApp(),
  db,
  models: {
    post: models.Post,
    user: models.User,
  },
};
