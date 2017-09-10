'use strict';

process.env.NODE_ENV = 'test';

import chai = require('chai');
import InternalServerError from './../../../jsonapi/errors/InternalServerError';

chai.should();

describe('jsonapi/errors/InternalServerError', () => {
  describe('#toJSON()', () => {
    it('should serialize to correct JSON', () => {
      const actual = new InternalServerError();
      const expected = {
        detail: 'There was an internal error processing your request. Please try again, or contact the system administrator.',
        status: 500,
        title: 'Internal Server Error',
      };

      JSON.parse(JSON.stringify(actual))
        .should.be.eql(JSON.parse(JSON.stringify(expected)));
    });
  });
});
