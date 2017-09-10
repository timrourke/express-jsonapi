'use strict';

import { Error as SequelizeError, Model, ValidationError } from 'sequelize';
import StringUtils from './../../utils/String';
import UnprocessableEntity from './UnprocessableEntity';
import inflection = require('inflection');
const titleize = inflection.titleize;
const underscore = inflection.underscore;

/**
 * Build an error object for a validation error.
 *
 * @param {Sequelize.ValidationErrorItem} sequelizeErrorItem The error item returned by Sequelize
 * @param {String} modelName Name of the model the error was thrown for
 * @return {UnprocessableEntity}
 */
function buildValidationError(sequelizeErrorItem, modelName: string): UnprocessableEntity {
  const modelTitle = titleize(underscore(modelName));
  const attr = StringUtils.convertCamelToDasherized(
    sequelizeErrorItem.path,
  );
  let msg = '';

  switch (sequelizeErrorItem.type) {
    case 'unique violation':
      msg = `${modelTitle}'s ${attr.replace(/-/g, ' ')} must be unique. "${sequelizeErrorItem.value}" was already chosen.`;
      break;
    case 'notNull Violation':
      msg = `${modelTitle}'s ${attr.replace(/-/g, ' ')} is required.`;
      break;
    default:
      msg = sequelizeErrorItem.message;
      break;
  }

  const error = new UnprocessableEntity(msg);

  error.setPointer(`/data/attributes/${attr}`);
  error.setTitle('Invalid Attribute');

  return error;
}

/**
 * Try to extract meaningful error objects out of a Sequelize error
 *
 * @param {mixed} err Error thrown by Sequelize
 * @param {Sequelize.Model} model Model the error was thrown for
 * @return {Promise}
 */
export default function tryHandlingCrudError(err: any, model: Model<any, any>) {
  return new Promise((resolve, reject) => {
    if (!(err instanceof SequelizeError)) {
      return reject(err);
    }

    if (err instanceof ValidationError) {
      const validationError = err as ValidationError;
      const errors = validationError.errors.map((sequelizeErrorItem) => {
        return buildValidationError(sequelizeErrorItem, model.name);
      });

      return resolve({
        json: {
          errors,
        },
        status: 422,
      });
    }

    return reject(err);
  });
}
