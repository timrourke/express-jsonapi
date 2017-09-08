import BaseError from './BaseError';

/**
 * BadRequest is useful for handling requests that should throw a 400.
 * 
 * @class BadRequest
 * @extends BaseError
 */
export default class BadRequest extends BaseError {

  /**
   * JSON API links property containing an `about` member that leads to further
   * details about this particular occurrence of the problem
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @property links
   * @type {mixed}
   */
  public links: any;

  /**
   * The error message
   * 
   * @property message
   * @type {String}
   * @default 'Bad request.'
   */
  public message: string = 'Bad request.';

  /**
   * JSON API source property referring to the query parameter that caused the
   * error
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @property source
   * @type {mixed}
   */
  public source: any;

  /**
   * Constructor
   * 
   * @param {String} message The message to use for the error's detail
   * @constructor
   */
  constructor (message: string = 'Bad request.') {
    super();    
    this.message = message;
  }

  /**
   * Set the source property on the request object
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @method setSource
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
   * @method toJSON
   * @return {Object}
   */
  public toJSON() {
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
