'use strict';

const NotFoundError = require('./../errors/NotFoundError');

module.exports = function(req, res, next) {
  res.status(404).json({
    errors: [
      new NotFoundError()
    ]
  });
};
