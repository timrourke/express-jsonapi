'use strict';

import UnprocessableEntity from './../errors/UnprocessableEntity';
import ForbiddenError from './../errors/ForbiddenError';
import { Request, Response, NextFunction } from 'express';

/**
 * Whether the request body should be validated. GET and DELETE requests do not
 * require request body validation for a Resource Object.
 *
 * @param {Express.Request} req Express Request object
 * @return {Boolean}
 */
function shouldValidateReqBody(req: Request): boolean {
  let isPatchOrPost = req.method === 'PATCH' || req.method === 'POST';
  let isApiRequest = req.path.indexOf('/api') === 0;

  return isPatchOrPost && isApiRequest;
}

/**
 * Handle a missing `data` member in the request body's Resource Object
 *
 * @param {Express.Response} res Express Response object
 * @return {Express.Response} res Express Response object
 */
function handleMissingDataMember(res: Response): Response {
  let error = new UnprocessableEntity(
    "Missing `data` Member at document's top level."
  );

  error.setPointer('');

  return res.status(422).json({
    errors: [error]
  });
}

/**
 * Build an error object for a missing `data.type` member in the request body's
 * Resource Object
 *
 * @return {UnprocessableEntity}
 */
function buildMissingDataTypeError(): UnprocessableEntity {
  let missingTypeError = new UnprocessableEntity(
    "Invalid Resource Object. Missing `data.type` Member at Resource Object's top level."
  );

  missingTypeError.setPointer('/data');
  missingTypeError.links = {
    about: 'http://jsonapi.org/format/#document-resource-objects'
  };

  return missingTypeError;
}

/**
* Build an error object for a missing `data.id` member in the request body's
* Resource Object
*
* @return {UnprocessableEntity}
*/
function buildMissingDataIdError(): UnprocessableEntity {
  let missingIdError = new UnprocessableEntity(
    "Invalid Resource Object for PATCH request. Missing `data.id` Member at Resource Object's top level."
  );

  missingIdError.setPointer('/data');
  missingIdError.links = {
    about: 'http://jsonapi.org/format/#document-resource-objects'
  };

  return missingIdError;
}

/**
 * Build an error object for a POST request containing a client-provided
 * `data.id` member in the request body's Resource Object
 *
 * @return {ForbiddenError}
 */
function buildHasClientProvidedIdError(): ForbiddenError {
  let hasClientProvidedIdError = new ForbiddenError(
    "Invalid Resource Object for POST request. Client-generated IDs for requests to create new resources is unsupported."
  );

  hasClientProvidedIdError.setPointer('/data/id');
  hasClientProvidedIdError.links = {
    about: 'http://jsonapi.org/format/#crud-creating'
  };

  return hasClientProvidedIdError;
}

/**
 * Validate PATCH and POST request bodies for `data`, `type`, `id`, and
 * `attributes` members of the Resource Object
 *
 * @see http://jsonapi.org/format/#document-resource-objects
 * @see http://jsonapi.org/format/#crud
 *
 * @param {Express.Request} req Express Request object
 * @param {Express.Response} res Express Response object
 * @param {Function} next Next Express middleware handler
 * @return {Express.Response|Express.NextFunction|void}
 */
export default function validateRequestBody(req: Request, res: Response, next: NextFunction): Response|NextFunction|void {
  if (!shouldValidateReqBody(req)) {
    return next();
  }

  let errors = [];

  // Return early with an error response if no `data` member is present
  if (!req.body.hasOwnProperty('data')) {
    return handleMissingDataMember(res);
  }

  // Build an error if the `data.type` member is not present
  if (!req.body.data.hasOwnProperty('type')) {
    errors.push(buildMissingDataTypeError());
  }

  // Build an error if PATCH request has no `data.id` member
  if (req.method === 'PATCH' && !req.body.data.id) {
    errors.push(buildMissingDataIdError());
  }

  // Return early with an error response if POST request has a client-provided
  // `data.id` member
  if (req.method === 'POST' && req.body.data.hasOwnProperty('id')) {
    errors.push(buildHasClientProvidedIdError());

    return res.status(403).json({
      errors: errors
    });
  }

  // If any errors were encountered, return a 422 response
  if (errors.length) {
    return res.status(422).json({
      errors: errors
    });
  }

  // If no errors were encountered, proceed with next middleware handler
  return next();
}
