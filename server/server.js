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

const User = require('./models/User')(db);

// Constants
const PORT = 3000;

// App
const app = express();

function logErrors(err, req, res, next) {
  console.error(err.message);
  console.error(err.stack);
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

app.use(JsonApiMiddlewareValidateContentType);

app.get('/api/users', function(req, res, next) {
  let controller = new UserController(User);

  controller.getList(req.params).then(users => {
    res.json({
      links: {
        self: 'http://localhost:3000/api/users'
      },
      data: users.map(user => new JsonApiResourceObject(user))
    });
  }).catch(err => {
    next(err);
  });
});

app.get('/api/users/:id', function(req, res, next) {
  let controller = new UserController(User);

  controller.getOne(req.params.id).then(user => {
    if (!user) {
      return res.status(404).json({
        data: null,
        errors: [
          new NotFoundError(`No user found with the id of ${req.params.id}`)
        ]
      });
    }

    res.json({
      links: new JsonApiResourceObjectLinks(user),
      data: new JsonApiResourceObject(user)
    });
  }).catch(err => {
    next(err);
  });
});

app.post('/api/users', function(req, res, next) {
  let controller = new UserController(User);
  const attrs = req.body.data.attributes;

  controller.createOne(attrs).then(user => {
    res.json({
      links: new JsonApiResourceObjectLinks(user),
      data: {
        type: 'users',
        attributes: user
      }
    });
  }).catch(err => {
    next(err);
  });
});

app.patch('/api/users/:id', function(req, res, next) {
  let controller = new UserController(User);
  const attrs = req.body.data.attributes;

  controller.updateOne(req.params.id, attrs).then(updatedUser => {
    if (!updatedUser) {
      return res.status(404).json({
        data: null,
        errors: [
          new NotFoundError(`No user found with the id of ${req.params.id}`)
        ]
      });
    }

    res.json({
      links: new JsonApiResourceObjectLinks(updatedUser),
      data: new JsonApiResourceObject(updatedUser)
    });
  }).catch(err => {
    next(err);
  });
});

app.delete('/api/users/:id', function(req, res, next) {
  let controller = new UserController(User);

  controller.deleteOne(req.params.id).then(deletedUser => {
    if (!deletedUser) {
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
    user: User
  }
};
