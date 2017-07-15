'use strict';

const StringUtils = require('./../utils/String');
import RelationshipLink, { RelationshipLinkConstructor } from './RelationshipLink';
import { Instance } from 'sequelize';

/**
 * Matches an attribute's key name for being a foreign key. If the key appears
 * to be a foreign key, the matching JSON API type string is returned. Otherwise
 * returns false.
 *
 * @param {String}
 * @return {String|Boolean}
 */
function foreignKey(attrKeyName) {
  let match = attrKeyName.match(/([\w-]+)-id/);

  return (match && match[1]) || false;
}

class ResourceObject {

  /**
   * Sequelize model instance for this Resource Object
   * 
   * @var {Sequelize.Instance}
   */
  modelInstance: Instance<any, any>;

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
      .filter(attr => {
        return (attr !== 'id') && !foreignKey(attr);
      })
      .forEach((newKeyName, index) => {
        let originalKeyName = originalAttrs[index];
        let value = instance.get(originalKeyName);

        serializedAttributes[newKeyName] = value;
      });

    return serializedAttributes;
  }

  /**
   * Serialize the model's relationships
   *
   * @param {Object} json The object to serialize as JSON
   */
  serializeRelationships(json) {
    let relationships = Object.keys(this.modelInstance.Model.associations);
    let id = String(this.modelInstance.get('id'));
    let originalAttrs = this.modelInstance.attributes;
    let foreignKeys = originalAttrs
      .map(attr => StringUtils.convertCamelToDasherized(attr))
      .map(attr => foreignKey(attr));

    if (!relationships.length) {
      return;
    }

    json.relationships = {};

    relationships.forEach(rel => {
      json.relationships[rel] = {
        links: new RelationshipLink(this.modelInstance.getType(), id, rel)
      };

      if (foreignKeys.indexOf(rel) !== -1) {
        let index = foreignKeys.indexOf(rel);
        json.relationships[rel].data = {
          type: this.modelInstance.Model.associations[rel].target.getType(),
          id: String(this.modelInstance.get(originalAttrs[index]))
        };
      }
    });
  }

  /**
   * Serialize this model instance to JSON API-compliant POJO
   *
   * @return {Object}
   */
  toJSON() {
    let model = this.modelInstance.Model;

    let id = String(this.modelInstance.get('id'));

    let json = {
      type: model.getType(),
      id: id,
      attributes: this.serializeAttributes(this.modelInstance.attributes),
    };

    if (model.hasOwnProperty('associations')) {
      this.serializeRelationships(json);
    }

    return json;
  }

}

module.exports = ResourceObject;
