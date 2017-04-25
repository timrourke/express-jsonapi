'use strict';

class BadRequest extends Error {

  /**
   * Set the source property on the request object
   *
   * @see http://jsonapi.org/format/#errors
   *
   * @param {String} param The invalid query parameter
   */
  setSource(param) {
    this.source = {
      parameter: param
    };
  }

  /**
   * toJSON
   *
   * @return {Object}
   */
  toJSON() {
    let ret = {
      status: 400,
      title: 'Bad Request',
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

module.exports = BadRequest;
