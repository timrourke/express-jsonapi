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
const notFoundHandler = require('./jsonapi/middleware/not-found-handler');
const UnprocessableEntity = require('./jsonapi/errors/UnprocessableEntity');
const ForbiddenError = require('./jsonapi/errors/ForbiddenError');

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

app.use(function(req, res, next) {
  let isPatchOrPost = req.method === 'PATCH' || req.method === 'POST';
  let isApiRequest = req.path.indexOf('/api') === 0;
  let shouldValidateReqBody = isPatchOrPost && isApiRequest;

  if (shouldValidateReqBody) {
    let errors = [];

    if (!req.body.hasOwnProperty('data')) {
      let error = new UnprocessableEntity(
        "Missing `data` Member at document's top level."
      );

      error.setPointer('');

      return res.status(422).json({
        errors: [error]
      });
    }

    if (!req.body.data.hasOwnProperty('type')) {
      let missingTypeError = new UnprocessableEntity(
        "Invalid Resource Object. Missing `data.type` Member at Resource Object's top level."
      );

      missingTypeError.setPointer('/data');
      missingTypeError.links = {
        about: 'http://jsonapi.org/format/#document-resource-objects'
      };

      errors.push(missingTypeError);
    }

    if (req.method === 'PATCH' && !req.body.data.id) {
      let missingIdError = new UnprocessableEntity(
        "Invalid Resource Object for PATCH request. Missing `data.id` Member at Resource Object's top level."
      );

      missingIdError.setPointer('/data');
      missingIdError.links = {
        about: 'http://jsonapi.org/format/#document-resource-objects'
      };

      errors.push(missingIdError);
    }

    if (req.method === 'POST' && req.body.data.hasOwnProperty('id')) {
      let hasClientProvidedIdError = new ForbiddenError(
        "Invalid Resource Object for POST request. Client-generated IDs for requests to create new resources is unsupported."
      );

      hasClientProvidedIdError.setPointer('/data/id');
      hasClientProvidedIdError.links = {
        about: 'http://jsonapi.org/format/#crud-creating'
      };

      errors.push(hasClientProvidedIdError);

      return res.status(403).json({
        errors: errors
      });
    }

    if (errors.length) {
      return res.status(422).json({
        errors: errors
      });
    }

    next();
  } else {
    next();
  }
});

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
