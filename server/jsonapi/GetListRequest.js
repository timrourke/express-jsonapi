'use strict';

const BadRequest = require('./errors/BadRequest');

/**
 * Parses the JSON API include param and builds a multidimensional graph of
 * relationships.
 *
 * For example, if the include param contains the values:
 * ```
 * 'foo.bar,foo.baz,foo.bar.bing,foo.bar.bang,foo.bar.bong'
 * ```
 *
 * The resulting graph of relationships should be:
 * ```
 * {
 *   foo: {
 *     bar: {
 *       bing: {},
 *       bang: {},
 *       bong: {}
 *     },
 *     baz: {}
 *   }
 * }
 * ```
 *
 * @param {String} includeParam The JSON API include param
 * @return {Object}
 */
function parseInclude(includeParam = "") {
  if (!includeParam) {
    return {};
  }

  let includesTree = {};
  let flatIncludesArray = includeParam
    .split(',')
    .map(string => string.split('.'));

  // Traverse each flat array of relationships and build a multi-dimensional
  // object to hold the graph of relationships
  flatIncludesArray.forEach(includesArray => {
    let branch = includesTree;

    includesArray.forEach(include => {
      if (branch[include] && Object.keys(branch[include]).length) {
        branch[include] = Object.assign({}, branch[include]);
      } else {
        branch[include] = {};
      }

      branch = branch[include];
    });
  });

  return includesTree;
}

class GetListRequest {
  /**
   * Constructor.
   *
   * @constructor
   * @param {Express.Request} req Express request object
   * @param {Sequelize.Model} model The Sequelize model definition
   */
  constructor(req, model) {
    let queryParams = (req.hasOwnProperty('query')) ?
      req.query :
      {};

    this.includes = parseInclude(queryParams.include);

    this.model = model;
  }

  /**
   * Validate the request
   *
   * @return {Promise} Promise that rejects with an array of errors, if any
   */
  validate() {
    return new Promise((resolve, reject) => {
      let errors = [];

      errors = errors.concat(this.validateIncludes());

      if (errors.length) {
        reject(errors);
      } else {
        resolve(this.includeStatement);
      }
    });
  }

  /**
   * Validate includes
   *
   * @return {Array} Array of errors, if any
   */
  validateIncludes() {
    if (!Object.keys(this.includes)) {
      return [];
    }

    this.includeStatement = { include: [] };
    let errors = [];

    validateSingleInclude(
      this.includes,
      this.model,
      this.includeStatement,
      errors
    );

    return errors;
  }

}

/**
 * Validate a single branch of the include graph and build the Sequelize query
 * object
 *
 * @param {Object} parent The parent branch of the include graph
 * @param {Sequelize.Model} currentModel The Sequelize Model representing the parent branch
 * @param {Object} includeStatement The Sequelize query object to pass to the query builder
 * @param {Array} errors An array of BadRequest errors
 */
function validateSingleInclude(parent, currentModel, includeStatement, errors) {
  // Iterate over each child of the parent branch of the include branch and try
  // to validate and build a query object for it
  Object.keys(parent).forEach(child => {
    if (currentModel.associations.hasOwnProperty(child)) {
      let includeObj = {};
      includeObj.model = currentModel.associations[child].target;
      includeStatement.include = includeStatement.include || [];
      includeStatement.include.push(includeObj);

      // If the included relationship also has relations to include, iterate
      // over each child inclusion and append those included relations.
      if (Object.keys(parent[child]).length) {
        validateSingleInclude(
          parent[child],
          includeObj.model,
          includeObj,
          errors
        );
      }
    } else {
      let msg = `The model "${currentModel.name}" has no relationship "${child}"`;
      let error = new BadRequest(msg);

      errors.push(error);
    }
  });
}

module.exports = GetListRequest;
