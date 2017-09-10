import BaseError from './BaseError';

/**
 * NotFoundError is useful for handling common 404 scenarios. Serializes into a
 * JSON API error object.
 *
 * @class NotFoundError
 * @extends BaseError
 */
export default class NotFoundError extends BaseError {

  /**
   * The error message
   *
   * @property message
   * @type {String}
   * @default 'Nothing found.'
   */
  public message: string = 'Nothing found.';

  /**
   * Constructor
   *
   * @param {String} message The message to use for the error's detail
   * @constructor
   */
  constructor(message: string = 'Nothing found.') {
    super();
    this.message = message;
  }

  /**
   * Serializes error to a JSON API error object
   *
   * @method toJSON
   * @return {Object}
   */
  public toJSON(): any {
    return {
      detail: this.message,
      status: 404,
      title: 'Not Found',
    };
  }

}
