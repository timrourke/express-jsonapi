'use strict';

process.env.NODE_ENV = 'test';

import * as chai from 'chai';
import ResourceObject from './../../jsonapi/ResourceObject';

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
    'bazItem',
  ];

  this.get = function(keyName) {
    if (keyName === 'id') {
      return this.id;
    }

    return keyName + ' value';
  };

  this.getType = () => {
    return 'mocked-model-instances';
  };

  this.id = 34672;

  this.Model = {
    associations: {
      bar: {},
      baz: {},
    },
    getType: () => {
      return 'mocked-model-instances';
    },
    name: 'mockedModelInstance',
  };
}

describe('jsonapi/ResourceObject', () => {
  describe('#toJSON()', () => {
    it('should convert to JSON API-compliant JSON without associations key', () => {
      const modelWithoutAssocs = new ModelInstanceStub();
      delete modelWithoutAssocs.Model.associations;

      const resource = new ResourceObject(modelWithoutAssocs);
      const actual = JSON.stringify(resource);
      const expected = {
        attributes: {
          'bar-thing': 'barThing value',
          'baz-item': 'bazItem value',
          'foo': 'foo value',
        },
        id: '34672',
        type: 'mocked-model-instances',
      };

      JSON.parse(actual)
        .should.be.eql(JSON.parse(JSON.stringify(expected)));
    });

    it('should convert to JSON API-compliant JSON with no associations', () => {
      const modelWithoutAssocs = new ModelInstanceStub();
      modelWithoutAssocs.Model.associations = {};

      const resource = new ResourceObject(modelWithoutAssocs);
      const actual = JSON.stringify(resource);
      const expected = {
        attributes: {
          'bar-thing': 'barThing value',
          'baz-item': 'bazItem value',
          'foo': 'foo value',
        },
        id: '34672',
        type: 'mocked-model-instances',
      };

      JSON.parse(actual)
        .should.be.eql(JSON.parse(JSON.stringify(expected)));
    });

    it('should convert to JSON API-compliant JSON with associations', () => {
      const resource = new ResourceObject(new ModelInstanceStub());
      const actual = JSON.stringify(resource);
      const expected = {
        attributes: {
          'bar-thing': 'barThing value',
          'baz-item': 'bazItem value',
          'foo': 'foo value',
        },
        id: '34672',
        relationships: {
          bar: {
            links: {
              related: 'http://localhost:3000/api/mocked-model-instances/34672/bar',
              self: 'http://localhost:3000/api/mocked-model-instances/34672/relationships/bar',
            },
          },
          baz: {
            links: {
              related: 'http://localhost:3000/api/mocked-model-instances/34672/baz',
              self: 'http://localhost:3000/api/mocked-model-instances/34672/relationships/baz',
            },
          },
        },
        type: 'mocked-model-instances',
      };

      JSON.parse(actual)
        .should.be.eql(JSON.parse(JSON.stringify(expected)));
    });

    it('should convert to JSON API-compliant JSON when no relationships', () => {
      const resource = new ResourceObject(new ModelInstanceStub());
      resource.modelInstance.Model.associations = {};
      const actual = JSON.stringify(resource);
      const expected = {
        attributes: {
          'bar-thing': 'barThing value',
          'baz-item': 'bazItem value',
          'foo': 'foo value',
        },
        id: '34672',
        type: 'mocked-model-instances',
      };

      JSON.parse(actual)
        .should.be.eql(JSON.parse(JSON.stringify(expected)));
    });
  });
});
