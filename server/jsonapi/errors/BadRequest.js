'use strict';

class BadRequest extends Error {

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

    return ret;
  }

}

module.exports = BadRequest;
