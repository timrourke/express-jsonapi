'use strict';

const NotFoundError = require('./../errors/NotFoundError');
const config = require('./../../config/config');

module.exports = function(req, res, next) {
  res.status(404).json({
    errors: [
      new NotFoundError(`Nothing found at ${config.getBaseUrl()}${req.originalUrl}`)
    ]
  });
};
