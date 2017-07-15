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
  }

  this.Model = {
    getType: function() {
      return 'mocked-model-instances';
    }
  };
}

describe('jsonapi/ResourceIdentifierObject', () => {
  describe('#toJSON()', () => {
    it('should convert to JSON API-compliant JSON', () => {
      let resourceIdentifierObject = new ResourceIdentifierObject(new ModelInstanceStub());
      let actual = JSON.stringify(resourceIdentifierObject);
      let expected = {
        type: 'mocked-model-instances',
        id: '784',
      };

      actual.should.be.eql(JSON.stringify(expected));
    });
  });
});