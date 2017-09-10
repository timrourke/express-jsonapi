'use strict';

process.env.NODE_ENV = 'test';

import chai = require('chai');
import BadRequest from './../../../jsonapi/errors/BadRequest';

chai.should();

describe('jsonapi/errors/BadRequest', () => {
  describe('#toJSON()', () => {
    it('should serialize to correct JSON', () => {
      const actual = new BadRequest('My hat is too big');

      const expected = {
        detail: 'My hat is too big',
        status: 400,
        title: 'Bad Request',
      };

      JSON.stringify(actual).should.be.eql(JSON.stringify(expected));
    });

    it('should serialize to correct JSON with links and source', () => {
      const actual = new BadRequest('A taco error has occurred.');
      actual.setSource('tacos');
      actual.links = 'blah';

      const expected = {
        detail: 'A taco error has occurred.',
        links: 'blah',
        source: {
          parameter: 'tacos',
        },
        status: 400,
        title: 'Bad Request',
      };

      JSON.parse(JSON.stringify(actual))
        .should.be.eql(JSON.parse(JSON.stringify(expected)));
    });
  });
});
