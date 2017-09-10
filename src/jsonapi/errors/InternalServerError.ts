import BaseError from './BaseError';

/**
 * InternalServerError useful for handling unrecoverable errors.
 *
 * @class InternalServerError
 * @extends BaseError
 */
export default class InternalServerError extends BaseError {

  /**
   * Serializes error to a JSON API error object
   *
   * @method toJSON
   * @return {Object}
   */
  public toJSON(): any {
    return {
      status: 500,
      title: 'Internal Server Error',
      detail: 'There was an internal error processing your request. Please try again, or contact the system administrator.', // tslint:disable-line
    };
  }

}
