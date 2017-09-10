'use strict';

process.env.NODE_ENV = 'test';

import * as chai from 'chai';
import ResourceIdentifierObject from './../../jsonapi/ResourceIdentifierObject';

chai.should();

/**
 * Stub for Sequelize.Instance
 *
 * @return {Object}
 */
function ModelInstanceStub() {
  this.id = 784;

  this.get = function(key) {
    return this[key];
  };

  this.Model = {
    getType: () => {
      return 'mocked-model-instances';
    },
  };
}

describe('jsonapi/ResourceIdentifierObject', () => {
  describe('#toJSON()', () => {
    it('should convert to JSON API-compliant JSON', () => {
      const resourceIdentifierObject = new ResourceIdentifierObject(new ModelInstanceStub());
      const actual = JSON.stringify(resourceIdentifierObject);
      const expected = {
        id: '784',
        type: 'mocked-model-instances',
      };

      JSON.parse(actual)
        .should.be.eql(JSON.parse(JSON.stringify(expected)));
    });
  });
});
