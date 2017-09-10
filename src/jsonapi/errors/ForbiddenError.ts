import BaseError from './BaseError';

interface ILinksAboutInterface {
  about: string;
}

interface ISourcePointerInterface {
  pointer: string;
}

interface IForbiddenErrorJsonInterface {
  status: number;
  title: string;
  detail?: string;
  links?: ILinksAboutInterface;
  source?: ISourcePointerInterface;
}

/**
 * ForbiddenError is useful for handling requests that should throw a 403.
 *
 * @class ForbiddenError
 * @extends BaseError
 */
export default class ForbiddenError extends BaseError {

  /**
   * JSON API `links` member referencing additional information about this error
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @property links
   * @type {ILinksAboutInterface}
   */
  public links: ILinksAboutInterface;

  /**
   * The error message
   *
   * @property message
   * @type {String}
   * @default 'This request is forbidden.'
   */
  public message: string = 'This request is forbidden.';

  /**
   * JSON API `source` member identifying field that triggered this error
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @property source
   * @type {ISourcePointerInterface}
   */
  public source: ISourcePointerInterface;

  /**
   * Constructor
   *
   * @param {String} message The message to use for the error's detail
   * @constructor
   */
  constructor(message: string = '') {
    super();
    this.message = message;
  }

  /**
   * Set the source.pointer property on the request object
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @method setPointer
   * @param {String} pointer The path to the invalid attribute
   */
  public setPointer(pointer: string): void {
    this.source = {
      pointer,
    };
  }

  /**
   * Serializes error to a JSON API error object
   *
   * @method toJSON
   * @return {Object}
   */
  public toJSON(): IForbiddenErrorJsonInterface {
    const ret: IForbiddenErrorJsonInterface = {
      status: 403,
      title: 'Forbidden',
    };

    if (this.hasOwnProperty('message') && this.message) {
      ret.detail = this.message;
    }

    if (this.hasOwnProperty('links')) {
      ret.links = this.links;
    }

    if (this.hasOwnProperty('source')) {
      ret.source = this.source;
    }

    return ret;
  }
}
