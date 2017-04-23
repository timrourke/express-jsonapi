'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const ForbiddenError = require('./../../../jsonapi/errors/ForbiddenError');

chai.should();

describe('jsonapi/errors/ForbiddenError', () => {
  describe('#toJSON()', () => {
    it('should serialize to correct JSON without message', () => {
      let actual = new ForbiddenError();

      let expected = {
        status: 403,
        title: 'Forbidden',
      };

      JSON.stringify(actual).should.be.eql(JSON.stringify(expected));
    });

    it('should serialize to correct JSON with message', () => {
      let actual = new ForbiddenError('Do not do that no');

      let expected = {
        status: 403,
        title: 'Forbidden',
        detail: 'Do not do that no',
      };

      JSON.stringify(actual).should.be.eql(JSON.stringify(expected));
    });

    it('should serialize to correct JSON with links and source', () => {
      let actual = new ForbiddenError('ew gross no');
      actual.setPointer('spork');
      actual.links = 'yodletown';

      let expected = {
        status: 403,
        title: 'Forbidden',
        detail: 'ew gross no',
        links: 'yodletown',
        source: {
          pointer: 'spork'
        }
      };

      JSON.stringify(actual).should.be.eql(JSON.stringify(expected));
    });
  });
});
