'use strict';

export default class BadRequest extends Error {

  /**
   * JSON API links property containing an `about` member that leads to further
   * details about this particular occurrence of the problem
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @var {mixed}
   */
  public links: any;

  /**
   * JSON API source property referring to the query parameter that caused the
   * error
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @var {mixed}
   */
  public source: any;

  /**
   * Set the source property on the request object
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @param {String} param The invalid query parameter
   */
  public setSource(param: string): void {
    this.source = {
      parameter: param
    };
  }

  /**
   * Serialize the instance into a JSON API error object
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @return {Object}
   */
  toJSON() {
    let ret: any = {
      status: 400,
      title: 'Bad Request',
      detail: this.message
    };

    if (this.hasOwnProperty('links')) {
      ret.links = this.links;
    }

    if (this.hasOwnProperty('source')) {
      ret.source = this.source;
    }

    return ret;
  }

}
