'use strict';

const Sequelize = require('sequelize');
const UnprocessableEntity = require('./UnprocessableEntity');
const StringUtils = require('./../../utils/String');

/**
 * Try to extract meaningful error objects out of a Sequelize error
 *
 * @param {mixed} err Error thrown by Sequelize
 * @param {Epress.Request} req Express Request object
 * @param {Sequelize.Model} model Model the error was thrown for
 * @return {Promise}
 */
function tryHandlingCrudError(err, req, model) {
  return new Promise((resolve, reject) => {
    if (!(err instanceof Sequelize.Error)) {
      return reject(err);
    }

    if (err instanceof Sequelize.ValidationError) {
      let errors = err.errors.map(sequelizeErrorItem => {
        let attr = StringUtils.convertCamelToDasherized(
          sequelizeErrorItem.path
        );
        let msg = sequelizeErrorItem.message;

        if (sequelizeErrorItem.type === 'notNull Violation') {
          msg = `${attr} is required.`;
        }

        let error = new UnprocessableEntity(msg);

        error.setPointer(`/data/attributes/${attr}`);
        error.setTitle('Invalid Attribute');

        return error;
      });

      return resolve({
        status: 422,
        json: {
          errors: errors
        }
      });
    }

    return reject(err);
  });
}

module.exports = tryHandlingCrudError;
