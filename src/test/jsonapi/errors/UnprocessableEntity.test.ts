'use strict';

process.env.NODE_ENV = 'test';

import chai = require('chai');
import UnprocessableEntity from './../../../jsonapi/errors/UnprocessableEntity';

chai.should();

describe('jsonapi/errors/UnprocessableEntity', () => {
  describe('#toJSON()', () => {
    it('should serialize to correct JSON', () => {
      const actual = new UnprocessableEntity('I just can\'t even');

      const expected = {
        detail: 'I just can\'t even',
        status: 422,
        title: 'Unprocessable Entity',
      };

      JSON.parse(JSON.stringify(actual))
        .should.be.eql(JSON.parse(JSON.stringify(expected)));
    });

    it('should serialize to correct JSON with links and source', () => {
      const actual = new UnprocessableEntity('Hooowhee that thing is BROKE');
      actual.setPointer('/things/other-things/this-one');
      actual.links = {
        about: 'linkz r kewl',
      };

      const expected = {
        detail: 'Hooowhee that thing is BROKE',
        links: {
          about: 'linkz r kewl',
        },
        source: {
          pointer: '/things/other-things/this-one',
        },
        status: 422,
        title: 'Unprocessable Entity',
      };

      JSON.parse(JSON.stringify(actual))
        .should.be.eql(JSON.parse(JSON.stringify(expected)));
    });

    it('should serialize with title if provided', () => {
      const actual = new UnprocessableEntity('The thing is incorrect');

      actual.setTitle('new title here');

      const expected = {
        detail: 'The thing is incorrect',
        status: 422,
        title: 'new title here',
      };

      JSON.parse(JSON.stringify(actual))
        .should.be.eql(JSON.parse(JSON.stringify(expected)));
    });
  });
});
