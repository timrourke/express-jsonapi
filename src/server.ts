'use strict';

import express = require('express');
import bodyParser = require('body-parser');
import methodOverride = require('method-override');
import compression = require('compression');
import helmet = require('helmet');
import initSequelize from './db/init-sequelize';
import Controller from './controllers/controller';
import InternalServerError from './jsonapi/errors/InternalServerError';
import JsonApiMiddlewareValidateContentType from './jsonapi/middleware/validate-content-type';
import JsonApiMiddlewareValidateRequestBody from './jsonapi/middleware/validate-request-body';
import notFoundHandler from './jsonapi/middleware/not-found-handler';

const db = initSequelize();
import * as ModelDefinitions from './models/models';
const Models = ModelDefinitions.defineModels(db);

const Route = require('./route/route');

// Constants
const PORT = 3000;

// App
const app = express();

/**
 * Log errors
 *
 * @param {mixed} err An error, if any
 * @param {Express.Request} req The Express request
 * @param {Express.Response} res The Express response
 * @param {Function} next The next Express handler/middleware
 */
function logErrors(err, req, res, next) {
  if (Array.isArray(err)) {
    err.forEach(error => {
      console.error(error.message);
      console.error(error.stack);
    });
  } else {
    console.error(err.message);
    console.error(err.stack);
  }
  next(err, req, res, next);
}

/**
 * Render an internal server error to the client
 *
 * @param {mixed} err An error, if any
 * @param {Express.Request} req The Express request
 * @param {Express.Response} res The Express response
 * @param {Function} next The next Express handler/middleware
 */
function clientErrorHandler(err, req, res, next) { //jshint ignore:line
  res.status(500).json({
    errors: [
      new InternalServerError()
    ]
  });
}

// Middleware
app.use(helmet());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json({
  type: 'application/vnd.api+json'
}));
app.use(methodOverride());
app.use(compression());

// Routes
app.get('/health', function (req, res) {
  res.send('Up.');
});

// Validate `Content-Type` request header
app.use(JsonApiMiddlewareValidateContentType);

// Validate request body for PATCH and POST requests to routes under "/api"
app.use(JsonApiMiddlewareValidateRequestBody);

// build routes
let UserRoute = new Route(app, Models.User, Controller);
let PostRoute = new Route(app, Models.Post, Controller);

UserRoute.initialize();
PostRoute.initialize();

app.use(notFoundHandler);
app.use(logErrors);
app.use(clientErrorHandler);

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);

// Export the application instance for testing
module.exports = {
  app: app,
  db: db,
  models: {
    user: Models.User,
    post: Models.Post
  }
};
