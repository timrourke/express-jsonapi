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
   * Serialize the model's relationships
   *
   * @param {Object} json The object to serialize as JSON
   * @param {String} type The model's JSON API type
   * @param {String} id The model instance's ID
   * @param {Object} associations The associations for the model
   */
  serializeRelationships(json, type, id, associations) {
    let relationships = Object.keys(associations);

    if (!relationships.length) {
      return;
    }

    json.relationships = {};

    relationships.forEach(rel => {
      json.relationships[rel] = {
        links: {
          self: `/${type}/${id}/relationships/${rel}`,
          related: `/${type}/${id}/${rel}`
        }
      };
    });
  }

  /**
   * Serialize this model instance to JSON API-compliant POJO
   *
   * @return {Object}
   */
  toJSON() {
    let model = this.modelInstance.Model;

    let type = inflection.pluralize(
      StringUtils.convertCamelToDasherized(model.name)
    );

    let id = String(this.modelInstance.id);

    let json = {
      type: inflection.pluralize(type),
      id: id,
      attributes: this.serializeAttributes(this.modelInstance.attributes),
    };

    if (model.hasOwnProperty('associations')) {
      this.serializeRelationships(json, type, id, model.associations);
    }

    return json;
  }

}

module.exports = ResourceObject;
