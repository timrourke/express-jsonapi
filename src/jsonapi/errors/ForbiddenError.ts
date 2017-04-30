'use strict';

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

export default class ForbiddenError extends Error {

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
   * Set the source.pointer property on the request object
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @param {String} pointer The path to the invalid attribute
   */
  setPointer(pointer: string) {
    this.source = {
      pointer: pointer
    };
  }

  /**
   * toJSON
   *
   * @return {Object}
   */
  toJSON(): ForbiddenErrorJsonInterface {
    let ret: ForbiddenErrorJsonInterface = {
      status: 403,
      title: 'Forbidden'
    };

    if (this.hasOwnProperty('message')) {
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
