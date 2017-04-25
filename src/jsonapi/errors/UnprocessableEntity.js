'use strict';

class UnprocessableEntity extends Error {

  /**
   * Set the source.pointer property on the request object
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @param {String} pointer The path to the invalid query parameter
   */
  setPointer(pointer) {
    this.source = {
      pointer: pointer
    };
  }

  /**
   * Set the title for the error's serialized JSON
   *
   * @param {String} title The title to set for the error's JSON
   */
  setTitle(title) {
    this.title = title;
  }

  /**
   * toJSON
   *
   * @return {Object}
   */
  toJSON() {
    let ret = {
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

module.exports = UnprocessableEntity;
