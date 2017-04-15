'use strict';

const inflection = require('inflection');
const StringUtils = require('./../utils/String');
const RelationshipLink = require('./RelationshipLink');

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
   * Serialize the model instance's attributes, excluding the model's ID.
   *
   * @param {Array} attributes
   * @return {Object}
   */
  serializeAttributes(attributes) {
    let serializedAttributes = {};
    let instance = this.modelInstance;
    let originalAttrs = instance.attributes.filter(attr => attr !== 'id');

    attributes
      .map(attr => StringUtils.convertCamelToDasherized(attr))
      .filter(attr => attr !== 'id')
      .forEach((newKeyName, index) => {
        let originalKeyName = originalAttrs[index];
        let value = instance.get(originalKeyName);
        let foreignKey = newKeyName.match(/([\w]+)-id/);

        if (foreignKey &&
            instance.Model.associations.hasOwnProperty(foreignKey[1])) {
          serializedAttributes[foreignKey[1]] = String(value);
        } else {
          serializedAttributes[newKeyName] = value;
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
        links: new RelationshipLink(type, id, rel)
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
