'use strict';

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

export default class UnprocessableEntity extends Error {

  /**
   * JSON API `links` member referencing additional information about this error
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @var {Object}
   */
  links: LinksAboutInterface;

  /**
   * JSON API `source` member identifying field that triggered this error
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @var {Object}
   */
  source: SourcePointerInterface;

  /**
   * JSON API `title` member of the error object
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @var {String}
   */
  title: string;

  /**
   * Set the source.pointer property on the request object
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @param {String} pointer The path to the invalid query parameter
   */
  setPointer(pointer: string) {
    this.source = {
      pointer: pointer
    };
  }

  /**
   * Set the title for the error's serialized JSON
   *
   * @param {String} title The title to set for the error's JSON
   */
  setTitle(title: string) {
    this.title = title;
  }

  /**
   * toJSON
   *
   * @return {Object}
   */
  toJSON() {
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
