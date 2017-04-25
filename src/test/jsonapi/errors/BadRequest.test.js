'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const BadRequest = require('./../../../jsonapi/errors/BadRequest');

chai.should();

describe('jsonapi/errors/BadRequest', () => {
  describe('#toJSON()', () => {
    it('should serialize to correct JSON', () => {
      let actual = new BadRequest('My hat is too big');

      let expected = {
        status: 400,
        title: 'Bad Request',
        detail: 'My hat is too big',
      };

      JSON.stringify(actual).should.be.eql(JSON.stringify(expected));
    });

    it('should serialize to correct JSON with links and source', () => {
      let actual = new BadRequest('A taco error has occurred.');
      actual.setSource('tacos');
      actual.links = 'blah';

      let expected = {
        status: 400,
        title: 'Bad Request',
        detail: 'A taco error has occurred.',
        links: 'blah',
        source: {
          parameter: 'tacos'
        }
      };

      JSON.stringify(actual).should.be.eql(JSON.stringify(expected));
    });
  });
});
