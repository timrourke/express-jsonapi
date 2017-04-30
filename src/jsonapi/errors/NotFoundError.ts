'use strict';

export default class NotFoundError extends Error {

  /**
   * toJSON
   *
   * @return {Object}
   */
  toJSON(): any {
    return {
      status: 404,
      title: 'Not Found',
      detail: this.message
    };
  }

}
