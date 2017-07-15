'use strict';

import { Instance, Model } from 'sequelize';
import { Request, Response, NextFunction } from 'express';
import BadRequest from './errors/BadRequest';
const StringUtils = require('./../utils/String');

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
function parseInclude(includeParam = ""): any {
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

/**
 * Parse the query params for pagination
 *
 * @param {Object} queryParams Request query params
 * @return {Object}
 */
function parsePagination(queryParams: any): any {
  if (!queryParams.hasOwnProperty('page')) {
    return {
      offset: 0,
      limit: 20
    };
  }

  return queryParams.page;
}

/**
 * Parse the query params for sorting
 *
 * @param {Object} queryParams Request query params
 * @return {Array}
 */
function parseSort(queryParams: any): Array<Array<string>> {
  if (!queryParams.hasOwnProperty('sort')) {
    return [];
  }

  return queryParams.sort
    .split(',')
    .map(attrName => {
      let direction = 'ASC';

      if (attrName.indexOf('-') === 0) {
        direction = 'DESC';
        attrName = attrName.slice(1);
      }

      return [attrName, direction];
    });
}

/**
 * Build a BadRequest error for an invalid sort param.
 *
 * @param {String} attrName The attribute name that caused the error
 * @return {BadRequest}
 */
function buildSortErrorInvalidAttr(attrName: string): BadRequest {
  let msg = `Cannot sort by "${attrName}". The resource does not have an attribute called "${attrName}"`;
  let error = new BadRequest(msg);

  error.setSource('sort');

  return error;
}

/**
 * Build a BadRequest error for invalid pagination params, when the mutually
 * exclusive params "page[offset]" and "page[number]" are both defined.
 *
 * @return {BadRequest}
 */
function buildPaginationErrHasOffsetAndNumber(): BadRequest {
  let msg = `Invalid pagination strategy. Use of "page[number]" and "page[offset]" as pagination params are mutually exclusive. Please use one or the other.`;
  let error = new BadRequest(msg);

  error.setSource('page');

  return error;
}

/**
 * Build a BadRequest error for invalid pagination params, when the mutually
 * exclusive params "page[limit]" and "page[size]" are both defined.
 *
 * @return {BadRequest}
 */
function buildPaginationErrHasLimitAndSize(): BadRequest {
  let msg = `Invalid pagination strategy. Use of "page[limit]" and "page[size]" as pagination params are mutually exclusive. Please use one or the other.`;
  let error = new BadRequest(msg);

  error.setSource('page');

  return error;
}

/**
 * Build a BadRequest error for invalid pagination params, when a pagination
 * param is not a number.
 *
 * @param {String} pageParam The query param that is invalid
 * @param {Mixed} invalidValue The invalid value for the invalid query param
 * @return {BadRequest}
 */
function buildPaginationErrIsNaN(pageParam: string, invalidValue: any): BadRequest {
  let msg = `Invalid pagination param "page[${pageParam}]" ("${invalidValue}"). "page[${pageParam}]" must be a number.`;
  let error = new BadRequest(msg);

  error.setSource(`page[${pageParam}]`);

  return error;
}

/**
 * Build a BadRequest error for invalid pagination params, when a pagination
 * param is lower than the minimum required number.
 *
 * @param {String} pageParam The query param that is invalid
 * @param {Mixed} invalidValue The invalid value for the invalid query param
 * @param {String} minimum The string describing the minimum required number
 * @return {BadRequest}
 */
function buildPaginationErrOffsetLessThanMin(pageParam: string, invalidValue: any, minimum: string): BadRequest {
  let msg = `Invalid pagination param "page[${pageParam}]" ("${invalidValue}"). "page[${pageParam}]" must not be a number lower than ${minimum}.`;
  let error = new BadRequest(msg);

  error.setSource(`page[${pageParam}]`);

  return error;
}

/**
 * GetListRequest describes a get list request that can be validated to ensure
 * compliance with JSON API
 * 
 * @class GetListRequest
 */
class GetListRequest {

  /**
   * Array of errors, if any.
   * 
   * @property {Mixed[]}
   */
  errors: Array<any>;

  /**
   * Include tree
   * 
   * @property {Object}
   */
  include: any;

  /**
   * Sequelize Model for this request
   * 
   * @property {Sequelize.Model}
   */
  model: Model<any, any>;

  /**
   * Array of orders, where each element is a tuple containing the attr name and the sort direction
   * 
   * @property {Array[]}
   */
  orders: Array<Array<string>>;

  /**
   * Pagination constraints for query
   * 
   * @property {Object}
   */
  pagination: any;

  /**
   * Sequelize query params to set query constraints
   * 
   * @property {Object}
   */
  sequelizeQueryParams: any;

  /**
   * Constructor.
   *
   * @constructor
   * @param {Express.Request} req Express request object
   * @param {Sequelize.Model} model The Sequelize model definition
   */
  constructor(req: Request, model: Model<any, any>) {
    let queryParams = (req.hasOwnProperty('query')) ?
      req.query :
      {};

    this.model = model;

    this.errors = [];

    this.sequelizeQueryParams = {};

    this.include = parseInclude(queryParams.include);

    this.pagination = parsePagination(queryParams);

    this.orders = parseSort(queryParams);
  }

  /**
   * Validate the request
   *
   * @method validate
   * @return {Promise} Promise that rejects with an array of errors, if any
   */
  public validate() {
    return new Promise((resolve, reject) => {
      this.errors = this.errors.concat(this.validateIncludes());

      this.errors = this.errors.concat(this.validatePagination());

      this.errors = this.errors.concat(this.validateSorts());

      if (this.errors.length) {
        reject(this.errors);
      } else {
        resolve(this.sequelizeQueryParams);
      }
    });
  }

  /**
   * Validate includes
   *
   * @method validateIncludes
   * @return {BadRequest[]} Array of errors, if any
   */
  private validateIncludes(): Array<BadRequest> {
    let errors = [];

    Object.assign(this.sequelizeQueryParams, { include: [] });

    validateSingleInclude(
      this.include,
      this.model,
      this.sequelizeQueryParams,
      errors
    );

    return errors;
  }

  /**
   * Validate pagination
   *
   * @method validatePagination
   * @return {BadRequest[]} Array of errors, if any
   */
  private validatePagination(): Array<BadRequest> {
    let hasOffset = this.pagination.hasOwnProperty('offset') && this.pagination.offset;
    let hasLimit  = this.pagination.hasOwnProperty('limit') && this.pagination.limit;
    let hasNumber = this.pagination.hasOwnProperty('number') && this.pagination.number;
    let hasSize   = this.pagination.hasOwnProperty('size') && this.pagination.size;
    let offset    = 0;
    let limit     = 20;
    let errors    = [];

    // Check for mutually exclusive params "page[offset]" and "page[number]"
    if (hasOffset && hasNumber) {
      errors.push(buildPaginationErrHasOffsetAndNumber());
    }

    // Check for mutually exclusive params "page[limit]" and "page[size]"
    if (hasLimit && hasSize) {
      errors.push(buildPaginationErrHasLimitAndSize());
    }

    // Calculate and validate the offset and limit for the offset/limit strategy
    if (hasLimit || hasOffset) {
      limit = (hasLimit) ?
        parseInt(this.pagination.limit, 10) :
        20;

        if (isNaN(limit)) {
          errors.push(buildPaginationErrIsNaN('limit', this.pagination.limit));
        } else if (limit < 0) {
          errors.push(
            buildPaginationErrOffsetLessThanMin(
              'limit',
              this.pagination.limit,
              '0 (zero)'
            )
          );
        }

      offset = (hasOffset) ?
        parseInt(this.pagination.offset, 10) :
        0;

        if (isNaN(offset)) {
          errors.push(buildPaginationErrIsNaN('offset', this.pagination.offset));
        } else if (offset < 0) {
          errors.push(
            buildPaginationErrOffsetLessThanMin(
              'offset',
              this.pagination.offset,
              '0 (zero)'
            )
          );
        }
    }

    // Calculate and validate offset and limit for the page/size strategy
    if (hasNumber || hasSize) {
      limit = (hasSize) ?
        parseInt(this.pagination.size, 10) :
        20;

        if (isNaN(limit)) {
          errors.push(buildPaginationErrIsNaN('size', this.pagination.size));
        } else if (limit < 0) {
          errors.push(
            buildPaginationErrOffsetLessThanMin(
              'size',
              this.pagination.size,
              '0 (zero)'
            )
          );
        }

      offset = (hasNumber) ?
        (parseInt(this.pagination.number, 10) * limit) - limit :
        0;

        if (isNaN(offset)) {
          errors.push(buildPaginationErrIsNaN('number', this.pagination.number));
        } else if (offset < 0) {
          errors.push(
            buildPaginationErrOffsetLessThanMin(
              'number',
              this.pagination.number,
              '1 (one)'
            )
          );
        }
    }

    Object.assign(this.sequelizeQueryParams, {
      limit: limit,
      offset: offset
    });

    return errors;
  }

  /**
   * Validate sorts
   *
   * @method validateSorts
   * @return {BadRequest[]} Array of errors, if any
   */
  private validateSorts(): Array<BadRequest> {
    let errors = [];
    let sorts = this.orders.map(sort => {
      let [attrName, direction] = sort;
      let columnName = StringUtils.convertDasherizedToCamelCase(attrName);

      if (this.model.attributes && !this.model.attributes.hasOwnProperty(columnName)) {
        errors.push(buildSortErrorInvalidAttr(attrName));
      }

      return [columnName, direction];
    });

    Object.assign(this.sequelizeQueryParams, {
      order: sorts
    });

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
function validateSingleInclude(parent, currentModel: Model<any, any>, includeStatement, errors: Array<BadRequest>) {
  // Iterate over each child of the parent branch of the include branch and try
  // to validate and build a query object for it
  Object.keys(parent).forEach(child => {
    if (currentModel.associations.hasOwnProperty(child)) {
      let includeObj: any = {};
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

      error.setSource('include');

      errors.push(error);
    }
  });
}

module.exports = GetListRequest;
