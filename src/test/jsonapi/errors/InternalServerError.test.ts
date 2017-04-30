'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
import InternalServerError from './../../../jsonapi/errors/InternalServerError';

chai.should();

describe('jsonapi/errors/InternalServerError', () => {
  describe('#toJSON()', () => {
    it('should serialize to correct JSON', () => {
      let actual = new InternalServerError();
      let expected = {
        status: 500,
        title: 'Internal Server Error',
        detail: 'There was an internal error processing your request. Please try again, or contact the system administrator.'
      };

      JSON.stringify(actual).should.be.eql(JSON.stringify(expected));
    });
  });
});
