'use strict';

import * as Express from 'express';

import BadRequest from './../errors/BadRequest';

/**
 * Build an error object for an unsupported media type.
 *
 * @param {String} contentType Value of the `Content-Type` request header
 * @return {Object}
 */
function buildUnsupportedMediaTypeError(contentType) {
  return {
    status: 415,
    title: 'Unsupported Media Type',
    detail: `Media type parameters or modifications to JSON API Content-Type header not supported ("${contentType}")`,
    links: {
      about: 'http://jsonapi.org/format/#content-negotiation-clients'
    }
  };
}

/**
 * Validate the `Content-Type` request header for JSON API compliance
 *
 * @see http://jsonapi.org/format/#content-negotiation-clients
 *
 * @param {Express.Request} req Request object
 * @param {Express.Response} res Response object
 * @param {Function} next Next middleware handler in the chain
 * @return {Mixed}
 */
export default function validateContentTypeMiddleware(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  let contentType = (req.get('content-type') || '').trim();
  let expected = 'application/vnd.api+json';

  // Return error if `Content-Type` request header contains the JSON API
  // descriptor but contains any other additional text
  if (contentType.indexOf(expected) !== -1 && contentType !== expected) {
    return res.status(415).json({
      errors: [buildUnsupportedMediaTypeError(contentType)]
    });

  // Return error if `Content-Type` request header does not contain the JSON
  // API descriptor at all
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
}
