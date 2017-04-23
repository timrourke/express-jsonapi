'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const UnprocessableEntity = require('./../../../jsonapi/errors/UnprocessableEntity');

chai.should();

describe('jsonapi/errors/UnprocessableEntity', () => {
  describe('#toJSON()', () => {
    it('should serialize to correct JSON', () => {
      let actual = new UnprocessableEntity('I just can\'t even');

      let expected = {
        status: 422,
        title: 'Unprocessable Entity',
        detail: 'I just can\'t even',
      };

      JSON.stringify(actual).should.be.eql(JSON.stringify(expected));
    });

    it('should serialize to correct JSON with links and source', () => {
      let actual = new UnprocessableEntity('Hooowhee that thing is BROKE');
      actual.setPointer('/things/other-things/this-one');
      actual.links = 'linkz r kewl';

      let expected = {
        status: 422,
        title: 'Unprocessable Entity',
        detail: 'Hooowhee that thing is BROKE',
        links: 'linkz r kewl',
        source: {
          pointer: '/things/other-things/this-one'
        }
      };

      JSON.stringify(actual).should.be.eql(JSON.stringify(expected));
    });

    it('should serialize with title if provided', () => {
      let actual = new UnprocessableEntity('The thing is incorrect');

      actual.setTitle('new title here');

      let expected = {
        status: 422,
        title: 'new title here',
        detail: 'The thing is incorrect',
      };

      JSON.stringify(actual).should.be.eql(JSON.stringify(expected));
    });
  });
});
