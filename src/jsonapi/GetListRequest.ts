'use strict';

import { NextFunction, Request, Response } from 'express';
import { Instance, Model } from 'sequelize';
import StringUtils from './../utils/String';
import BadRequest from './errors/BadRequest';

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
function parseInclude(includeParam = ''): any {
  if (!includeParam) {
    return {};
  }

  const includesTree = {};
  const flatIncludesArray = includeParam
    .split(',')
    .map((str) => str.split('.'));

  // Traverse each flat array of relationships and build a multi-dimensional
  // object to hold the graph of relationships
  flatIncludesArray.forEach((includesArray) => {
    let branch = includesTree;

    includesArray.forEach((include) => {
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
      limit: 20,
      offset: 0,
    };
  }

  return queryParams.page;
}

/**
 * Parse the query params for sorting
 *
 * @param {Object} queryParams Request query params
 * @return {String[][]}
 */
function parseSort(queryParams: any): string[][] {
  if (!queryParams.hasOwnProperty('sort')) {
    return [];
  }

  return queryParams.sort
    .split(',')
    .map((attrName) => {
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
  const msg = `Cannot sort by "${attrName}". The resource does not have an attribute called "${attrName}"`;
  const error = new BadRequest(msg);

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
  const msg = `Invalid pagination strategy. Use of "page[number]" and "page[offset]" as pagination params are mutually exclusive. Please use one or the other.`;
  const error = new BadRequest(msg);

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
  const msg = `Invalid pagination strategy. Use of "page[limit]" and "page[size]" as pagination params are mutually exclusive. Please use one or the other.`;
  const error = new BadRequest(msg);

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
  const msg = `Invalid pagination param "page[${pageParam}]" ("${invalidValue}"). "page[${pageParam}]" must be a number.`;
  const error = new BadRequest(msg);

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
  const msg = `Invalid pagination param "page[${pageParam}]" ("${invalidValue}"). "page[${pageParam}]" must not be a number lower than ${minimum}.`;
  const error = new BadRequest(msg);

  error.setSource(`page[${pageParam}]`);

  return error;
}

/**
 * GetListRequest describes a get list request that can be validated to ensure
 * compliance with JSON API
 *
 * @class GetListRequest
 */
export default class GetListRequest {

  /**
   * Array of errors, if any.
   *
   * @property errors
   * @type {Mixed[]}
   */
  private errors: any[];

  /**
   * Include tree
   *
   * @property include
   * @type {Object}
   */
  private include: any;

  /**
   * Sequelize Model for this request
   *
   * @property model
   * @type {Sequelize.Model}
   */
  private model: Model<any, any>;

  /**
   * Array of orders, where each element is a tuple containing the attr name and the sort direction
   *
   * @property orders
   * @type {String[][]}
   */
  private orders: string[][];

  /**
   * Pagination constraints for query
   *
   * @property pagination
   * @type {Object}
   */
  private pagination: any;

  /**
   * Sequelize query params to set query constraints
   * 
   * @property sequelizeQueryParams
   * @type {Object}
   */
  private sequelizeQueryParams: any;

  /**
   * Constructor.
   *
   * @constructor
   * @param {Express.Request} req Express request object
   * @param {Sequelize.Model} model The Sequelize model definition
   */
  constructor(req: Request, model: Model<any, any>) {
    const queryParams = (req.hasOwnProperty('query')) ?
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
   * Whether the pagination params have a value for 'offset'
   *
   * @method paginationHasOffset
   * @return {Boolean}
   */
  private paginationHasOffset(): boolean {
    return this.pagination.hasOwnProperty('offset') &&
      this.pagination.offset;
  }

  /**
   * Whether the pagination params have a value for 'limit'
   *
   * @method paginationHasLimit
   * @return {Boolean}
   */
  private paginationHasLimit(): boolean {
    return this.pagination.hasOwnProperty('limit') &&
      this.pagination.limit;
  }

  /**
   * Whether the pagination params have a value for 'number'
   *
   * @method paginationHasNumber
   * @return {Boolean}
   */
  private paginationHasNumber(): boolean {
    return this.pagination.hasOwnProperty('number') &&
      this.pagination.number;
  }

  /**
   * Whether the pagination params have a value for 'size'
   *
   * @method paginationHasSize
   * @return {Boolean}
   */
  private paginationHasSize(): boolean {
    return this.pagination.hasOwnProperty('size') &&
      this.pagination.size;
  }

  /**
   * Check the parsed value of a pagination query param for errors
   *
   * @param {String} paramName String name of the query param to check for errors
   * @param {mixed} parsedValue Parsed value of the query param to check for errors
   * @param {String} minimumString String to describe the minimum possible value for the
   *   query param in question in the error message if parsedValue < allowed min
   * @param {BadRequest[]} errors Array of errors
   */
  private checkParsedPaginationParamForErrors(
    paramName: string,
    parsedValue: any,
    minimumString: string,
    errors: Array<BadRequest>
  ): void {
    if (isNaN(parsedValue)) {
      errors.push(buildPaginationErrIsNaN(paramName, this.pagination[paramName]));
    } else if (parsedValue < 0) {
      errors.push(buildPaginationErrOffsetLessThanMin(
          paramName,
          this.pagination[paramName],
          minimumString,
       ));
    }
  }

  /**
   * Calculate the limit for the LIMIT clause when using the offset/limit
   * pagination strategy
   *
   * @method calculateLimitForOffsetLimitStrategy
   * @param {BadRequest[]} errors Array of errors
   * @return {Number}
   */
  private calculateLimitForOffsetLimitStrategy(errors: BadRequest[]): number {
    const limit = (this.paginationHasLimit()) ?
      parseInt(this.pagination.limit, 10) :
      20;

    this.checkParsedPaginationParamForErrors('limit', limit, '0 (zero)', errors);

    return limit;
  }

  /**
   * Calculate the offset for the LIMIT clause when using the offset/limit
   * pagination strategy
   *
   * @method calculateOffsetForOffsetLimitStrategy
   * @param {BadRequest[]} errors Array of errors
   * @return {Number}
   */
  private calculateOffsetForOffsetLimitStrategy(errors: BadRequest[]): number {
    const offset = (this.paginationHasOffset()) ?
      parseInt(this.pagination.offset, 10) :
      0;

    this.checkParsedPaginationParamForErrors('offset', offset, '0 (zero)', errors);

    return offset;
  }

  /**
   * Calculate the limit for the LIMIT clause when using the page number/size
   * pagination strategy
   *
   * @method calculateLimitForPageNumberSizeStrategy
   * @param {BadRequest[]} errors Array of errors
   * @return {Number}
   */
  private calculateLimitForPageNumberSizeStrategy(errors: BadRequest[]): number {
    const limit = (this.paginationHasSize()) ?
      parseInt(this.pagination.size, 10) :
      20;

    this.checkParsedPaginationParamForErrors('size', limit, '0 (zero)', errors);

    return limit;
  }

  /**
   * Calculate the offset for the LIMIT clause when using the page number/size
   * pagination strategy
   *
   * @method calculateOffsetForPageNumberSizeStrategy
   * @param {Number} limit Parsed value of the limit for pagination
   * @param {BadRequest[]} errors Array of errors
   * @return {Number}
   */
  private calculateOffsetForPageNumberSizeStrategy(limit: number, errors: BadRequest[]): number {
    const offset = (this.paginationHasNumber()) ?
      (parseInt(this.pagination.number, 10) * limit) - limit :
      0;

    this.checkParsedPaginationParamForErrors('number', offset, '1 (one)', errors);

    return offset;
  }

  /**
   * Validate pagination
   *
   * @method validatePagination
   * @return {BadRequest[]} Array of errors, if any
   */
  private validatePagination(): Array<BadRequest> {
    let offset = 0;
    let limit = 20;
    const errors: BadRequest[] = [];

    // Check for mutually exclusive params "page[offset]" and "page[number]"
    if (this.paginationHasOffset() && this.paginationHasNumber()) {
      errors.push(buildPaginationErrHasOffsetAndNumber());
    }

    // Check for mutually exclusive params "page[limit]" and "page[size]"
    if (this.paginationHasLimit() && this.paginationHasSize()) {
      errors.push(buildPaginationErrHasLimitAndSize());
    }

    // Calculate and validate the offset and limit for the offset/limit strategy
    if (this.paginationHasLimit() || this.paginationHasOffset()) {
      limit = this.calculateLimitForOffsetLimitStrategy(errors);
      offset = this.calculateOffsetForOffsetLimitStrategy(errors);
    }

    // Calculate and validate offset and limit for the page/size strategy
    if (this.paginationHasNumber() || this.paginationHasSize()) {
      limit = this.calculateLimitForPageNumberSizeStrategy(errors);
      offset = this.calculateOffsetForPageNumberSizeStrategy(limit, errors);
    }

    Object.assign(this.sequelizeQueryParams, {
      limit,
      offset,
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

      // TODO: support sorting on fields that are not columns of the model
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
 * @param {BadRequest[]} errors An array of BadRequest errors
 */
function validateSingleInclude(parent, currentModel: Model<any, any>, includeStatement, errors: Array<BadRequest>): void {
  // Iterate over each child of the parent branch of the include branch and try
  // to validate and build a query object for it
  Object.keys(parent).forEach(child => {
    if (currentModel.hasOwnProperty('associations') && currentModel.associations.hasOwnProperty(child)) {
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