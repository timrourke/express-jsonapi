'use strict';

/**
 * Parse the params.
 *
 * Parses a params object and builds the required data structures to respond to
 * a JSON API-compliant request.
 *
 * Will parse params for the following JSON API request params:
 *   - include
 *   - fields
 *   - sort
 *   - page[number], page[size], page[offset], page[limit]
 *   - filter
 *
 * @see http://jsonapi.org/format/#fetching
 *
 * @param {Object} params Params to parse
 */
function parseJsonApiRequestParams(params) {
  if (params.hasOwnProperty('include')) {
    this.includes = parseInclude(params.include);
  }
}

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
 * @param {Object} includeParam The JSON API include param
 * @return {Object}
 */
function parseInclude(includeParam) {
  let includesTree = {};
  let flatIncludesArray = includeParam
    .split(',')
    .map(string => string.split('.'));

  // Traverse each flat array of relationships and build a multi-dimensional
  // object to hold the graph of relationships
  flatIncludesArray.forEach(includesArray => {
    let branch = includesTree;

    includesArray.forEach((include, index) => {
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
   * @param {Express.Request} req Express request object
   */
  constructor(req) {
    parseJsonApiRequestParams.call(this, req.params);
  }

}

module.exports = GetListRequest;
