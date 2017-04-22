'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const compression = require('compression');
const helmet = require('helmet');
const initSequelize = require('./db/init-sequelize');
const db = initSequelize();
const Controller = require('./controllers/controller');
const InternalServerError = require('./jsonapi/errors/InternalServerError');
const JsonApiMiddlewareValidateContentType = require('./jsonapi/middleware/validate-content-type');
const JsonApiMiddlewareValidateRequestBody = require('./jsonapi/middleware/validate-request-body');
const notFoundHandler = require('./jsonapi/middleware/not-found-handler');

const defineModels = require('./models/models');
const Models = defineModels(db);

const Route = require('./route/route');

// Constants
const PORT = 3000;

// App
const app = express();

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

function clientErrorHandler(err, req, res, next) {
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
