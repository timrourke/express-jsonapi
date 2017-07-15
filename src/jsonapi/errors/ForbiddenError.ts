import BaseError from './BaseError';

interface LinksAboutInterface {
  about: string;
}

interface SourcePointerInterface {
  pointer: string;
}

interface ForbiddenErrorJsonInterface {
  status: number;
  title: string;
  detail?: string;
  links?: LinksAboutInterface;
  source?: SourcePointerInterface;
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
   * @property {LinksAboutInterface}
   */
  public links: LinksAboutInterface;
  
  /**
   * The error message
   * 
   * @property {String}
   */
  public message: string = 'This request is forbidden.';

  /**
   * JSON API `source` member identifying field that triggered this error
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @property {SourcePointerInterface}
   */
  public source: SourcePointerInterface;

  /**
   * Constructor
   * 
   * @param {String} message The message to use for the error's detail
   * @constructor
   */
  constructor (message: string = '') {
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
  public setPointer(pointer: string) {
    this.source = {
      pointer: pointer
    };
  }

  /**
   * Serializes error to a JSON API error object
   *
   * @method toJSON
   * @return {Object}
   */
  public toJSON(): ForbiddenErrorJsonInterface {
    let ret: ForbiddenErrorJsonInterface = {
      status: 403,
      title: 'Forbidden'
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
