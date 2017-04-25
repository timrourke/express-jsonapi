'use strict';

class NotFoundError extends Error {

  /**
   * toJSON
   *
   * @return {Object}
   */
  toJSON() {
    return {
      status: 404,
      title: 'Not Found',
      detail: this.message
    };
  }

}

module.exports = NotFoundError;
