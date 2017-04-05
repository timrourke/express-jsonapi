'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const compression = require('compression');
const helmet = require('helmet');
const initSequelize = require('./db/init-sequelize');
const db = initSequelize();
const JsonApiResourceObject = require('./jsonapi/ResourceObject');
const JsonApiResourceObjectLinks = require('./jsonapi/ResourceObjectLinks');
const UserController = require('./controllers/user');
const NotFoundError = require('./jsonapi/errors/NotFoundError');
const InternalServerError = require('./jsonapi/errors/InternalServerError');
const JsonApiMiddlewareValidateContentType = require('./jsonapi/middleware/validate-content-type');
const JsonApiExtractIncludedModelsAsFlatArray = require('./jsonapi/extract-included-models-as-flat-array');
const GetListRequest = require('./jsonapi/GetListRequest');

const defineModels = require('./models/models');
const Models = defineModels(db);

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
  next(err);
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

app.get('/api/users', function(req, res, next) {
  let controller = new UserController(Models.User);
  let request = new GetListRequest(req, Models.User);

  request.validate().then(sequelizeQueryParams => {
    controller.getList(sequelizeQueryParams).then(foundModels => {
      let json = {
        links: {
          self: 'http://localhost:3000/api/users'
        },
        data: foundModels.map(model => new JsonApiResourceObject(model))
      };

      let included = [];

      JsonApiExtractIncludedModelsAsFlatArray(foundModels, included);

      if (included.length) {
        json.included = included.map(model => new JsonApiResourceObject(model));
      }

      res.json(json);
    }).catch(err => {
      next(err);
    });
  }).catch(errors => {
    res.status(400).json({
      errors: errors
    });
  });
});

app.get('/api/users/:id', function(req, res, next) {
  let controller = new UserController(Models.User);

  controller.getOne(req.params.id).then(foundModel => {
    if (!foundModel) {
      return res.status(404).json({
        data: null,
        errors: [
          new NotFoundError(`No user found with the id of ${req.params.id}`)
        ]
      });
    }

    res.json({
      links: new JsonApiResourceObjectLinks(foundModel),
      data: new JsonApiResourceObject(foundModel)
    });
  }).catch(err => {
    next(err);
  });
});

app.post('/api/users', function(req, res, next) {
  let controller = new UserController(Models.User);
  const attrs = req.body.data.attributes;

  controller.createOne(attrs).then(foundModel => {
    res.json({
      links: new JsonApiResourceObjectLinks(foundModel),
      data: {
        type: 'users',
        attributes: foundModel
      }
    });
  }).catch(err => {
    next(err);
  });
});

app.patch('/api/users/:id', function(req, res, next) {
  let controller = new UserController(Models.User);
  const attrs = req.body.data.attributes;

  controller.updateOne(req.params.id, attrs).then(updatedModel => {
    if (!updatedModel) {
      return res.status(404).json({
        data: null,
        errors: [
          new NotFoundError(`No user found with the id of ${req.params.id}`)
        ]
      });
    }

    res.json({
      links: new JsonApiResourceObjectLinks(updatedModel),
      data: new JsonApiResourceObject(updatedModel)
    });
  }).catch(err => {
    next(err);
  });
});

app.delete('/api/users/:id', function(req, res, next) {
  let controller = new UserController(Models.User);

  controller.deleteOne(req.params.id).then(deletedModel => {
    if (!deletedModel) {
      return res.status(404).json({
        data: null,
        errors: [
          new NotFoundError(`No user found with the id of ${req.params.id}`)
        ]
      });
    }

    res.status(204).end();
  }).catch(err => {
    next(err);
  });
});

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
