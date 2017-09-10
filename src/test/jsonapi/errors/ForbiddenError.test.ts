'use strict';

process.env.NODE_ENV = 'test';

import chai = require('chai');
import ForbiddenError from './../../../jsonapi/errors/ForbiddenError';

chai.should();

describe('jsonapi/errors/ForbiddenError', () => {
  describe('#toJSON()', () => {
    it('should serialize to correct JSON without message', () => {
      const actual = new ForbiddenError();

      const expected = {
        status: 403,
        title: 'Forbidden',
      };

      JSON.parse(JSON.stringify(actual))
        .should.be.eql(JSON.parse(JSON.stringify(expected)));
    });

    it('should serialize to correct JSON with message', () => {
      const actual = new ForbiddenError('Do not do that no');

      const expected = {
        detail: 'Do not do that no',
        status: 403,
        title: 'Forbidden',
      };

      JSON.parse(JSON.stringify(actual))
        .should.be.eql(JSON.parse(JSON.stringify(expected)));
    });

    it('should serialize to correct JSON with links and source', () => {
      const actual = new ForbiddenError('ew gross no');
      actual.setPointer('spork');
      actual.links = {
        about: 'yodletown',
      };

      const expected = {
        detail: 'ew gross no',
        links: {
          about: 'yodletown',
        },
        source: {
          pointer: 'spork',
        },
        status: 403,
        title: 'Forbidden',
      };

      JSON.parse(JSON.stringify(actual))
        .should.be.eql(JSON.parse(JSON.stringify(expected)));
    });
  });
});
