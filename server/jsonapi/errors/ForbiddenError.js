'use strict';

class ForbiddenError extends Error {

  /**
   * Set the source.pointer property on the request object
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @param {String} pointer The path to the invalid attribute
   */
  setPointer(pointer) {
    this.source = {
      pointer: pointer
    };
  }

  /**
   * toJSON
   *
   * @return {Object}
   */
  toJSON() {
    let ret = {
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

module.exports = ForbiddenError;
