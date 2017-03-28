'use strict';

class InternalServerError extends Error {

  /**
   * toJSON
   *
   * @return {Object}
   */
  toJSON() {
    return {
      status: 500,
      title: 'Internal Server Error',
      detail: 'There was an internal error processing your request. Please try again, or contact the system administrator.'
    };
  }

}

module.exports = InternalServerError;
