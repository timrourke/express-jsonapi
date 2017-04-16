'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const ResourceObject = require('./../../jsonapi/ResourceObject.js');

chai.should();

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

  this.getType = function() {
    return 'mocked-model-instances';
  };

  this.id = 34672;

  this.Model = {
    name: 'mockedModelInstance',
    associations: {
      'bar': {},
      'baz': {}
    },
    getType: function() {
      return 'mocked-model-instances';
    }
  };
}

describe('jsonapi/ResourceObject', () => {
  describe('#toJSON()', () => {
    it('should convert to JSON API-compliant JSON', () => {
      let resource = new ResourceObject(new ModelInstanceStub());
      let actual = JSON.stringify(resource);
      let expected = {
        type: 'mocked-model-instances',
        id: '34672',
        attributes: {
          'foo': 'foo value',
          'bar-thing': 'barThing value',
          'baz-item': 'bazItem value'
        },
        relationships: {
          bar: {
            links: {
              self: 'http://localhost:3000/api/mocked-model-instances/34672/relationships/bar',
              related: 'http://localhost:3000/api/mocked-model-instances/34672/bar',
            }
          },
          baz: {
            links: {
              self: 'http://localhost:3000/api/mocked-model-instances/34672/relationships/baz',
              related: 'http://localhost:3000/api/mocked-model-instances/34672/baz',
            }
          },
        }
      };

      actual.should.be.eql(JSON.stringify(expected));
    });

    it('should convert to JSON API-compliant JSON when no relationships', () => {
      let resource = new ResourceObject(new ModelInstanceStub());
      resource.modelInstance.Model.associations = {};
      let actual = JSON.stringify(resource);
      let expected = {
        type: 'mocked-model-instances',
        id: '34672',
        attributes: {
          'foo': 'foo value',
          'bar-thing': 'barThing value',
          'baz-item': 'bazItem value'
        }
      };

      actual.should.be.eql(JSON.stringify(expected));
    });
  });
});
