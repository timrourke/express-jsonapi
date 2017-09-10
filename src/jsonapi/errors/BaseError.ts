/**
 * BaseError allows extension of the native Error object with additional methods
 * and properties.
 *
 * @class BaseError
 * @extends Error
 */
export default class BaseError {

  /**
   * Constructor.
   *
   * @constructor
   */
  constructor() {
    Error.apply(this, arguments);
  }

}
