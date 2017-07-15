import BaseError from './BaseError';

interface LinksAboutInterface {
  about: string;
}

interface SourcePointerInterface {
  pointer: string;
}

interface ErrorObjectJsonInterface {
  status: number;
  title: string;
  detail?: string;
  links?: LinksAboutInterface;
  source?: SourcePointerInterface;
}

/**
 * UnprocessableEntity is useful for handling requests that should throw a 422.
 * 
 * @class UnprocessableEntity
 * @extends BaseError
 */
export default class UnprocessableEntity extends BaseError {

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
  public message: string = "Unprocessable entity";
  
  /**
   * JSON API `source` member identifying field that triggered this error
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @property {SourcePointerInterface}
   */
  public source: SourcePointerInterface;

  /**
   * JSON API `title` member of the error object
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @property {String}
   */
  public title: string = 'Unprocessable Entity';

  /**
   * Constructor
   * 
   * @param {String} message The message to use for the error's detail
   * @constructor
   */
  constructor (message: string = 'Unprocessable Entity') {
    super();    
    this.message = message;
  }

  /**
   * Set the source.pointer property on the request object
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @method setPointer
   * @param {String} pointer The path to the invalid query parameter
   */
  public setPointer(pointer: string) {
    this.source = {
      pointer: pointer
    };
  }

  /**
   * Set the title for the error's serialized JSON
   *
   * @method setTitle
   * @param {String} title The title to set for the error's JSON
   */
  public setTitle(title: string) {
    this.title = title;
  }

  /**
   * Serializes error to a JSON API object
   *
   * @method toJSON
   * @return {Object}
   */
  public toJSON() {
    let ret: ErrorObjectJsonInterface = {
      status: 422,
      title: this.title || 'Unprocessable Entity',
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
