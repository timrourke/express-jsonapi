process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const ResourceObject = require('./../../jsonapi/ResourceObject.js');

/**
 * Stub for Sequelize.Instance
 *
 * @return {Object}
 */
function ModelInstanceStub() {
  this.attributes = [
    'id',
    'foo',
    'barThing',
    'bazItem'
  ];

  this.get = function(keyName) {
    return keyName + ' value';
  };

  this.id = 34672;

  this.Model = {
    name: 'mockedModelInstance'
  };
};

describe('jsonapi/ResourceObject', () => {
  describe('#toJSON()', () => {
    it('should convert to JSON API-compliant JSON', () => {
      let actual = new ResourceObject(new ModelInstanceStub()).toJSON();
      let expected = {
        type: 'mocked-model-instances',
        id: '34672',
        attributes: {
          'foo': 'foo value',
          'bar-thing': 'barThing value',
          'baz-item': 'bazItem value'
        }
      };

      actual.should.be.eql(expected);
    });
  });
});
