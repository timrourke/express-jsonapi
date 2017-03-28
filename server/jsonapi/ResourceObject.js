'use strict';

const inflection = require('inflection');
const StringUtils = require('./../utils/String');

class ResourceObject {

  /**
   * Constructor.
   *
   * @param modelInstance {Sequelize.Instance}
   */
  constructor(modelInstance) {
    this.modelInstance = modelInstance;
  }

  /**
   * Serialize the model instance's attributes
   *
   * @param {Array} attributes
   * @return {Object}
   */
  serializeAttributes(attributes) {
    let serializedAttributes = {};

    attributes
      .map(attr => StringUtils.convertCamelToDasherized(attr))
      .forEach((newKeyName, index) => {
        if (newKeyName !== 'id') {
          let originalKeyName = this.modelInstance.attributes[index];
          serializedAttributes[newKeyName] = this.modelInstance.get(originalKeyName);
        }
      });

    return serializedAttributes;
  }

  /**
   * Serialize this model instance to JSON API-compliant POJO
   *
   * @return {Object}
   */
  toJSON() {
    let type = inflection.pluralize(
      StringUtils.convertCamelToDasherized(this.modelInstance.Model.name)
    );

    let ret = {
      type: inflection.pluralize(type),
      id: String(this.modelInstance.id),
      attributes: this.serializeAttributes(this.modelInstance.attributes),
    };

    return ret;
  }

}

module.exports = ResourceObject;
