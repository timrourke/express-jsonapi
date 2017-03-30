'use strict';

const BadRequest = require('./../errors/BadRequest');

module.exports = function(req, res, next) {
  let contentType = (req.get('content-type') || '').trim();
  let expected = 'application/vnd.api+json';

  if (contentType.indexOf(expected) !== -1 && contentType !== expected) {
    return res.status(415).json({
      errors: [{
        status: 415,
        title: 'Unsupported Media Type',
        detail: `Media type parameters or modifications to JSON API Content-Type header not supported ("${contentType}")`,
        links: {
          about: 'http://jsonapi.org/format/#content-negotiation-clients'
        }
      }]
    });
  } else if (contentType !== expected) {
    let error = new BadRequest(`Unsupported value for Content-Type header ("${contentType}")`);

    error.links = {
      about: 'http://jsonapi.org/format/#content-negotiation-clients'
    };

    return res.status(400).json({
      errors: [error]
    });
  }

  next();
};
