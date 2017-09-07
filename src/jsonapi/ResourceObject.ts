'use strict';

const StringUtils = require('./../utils/String');
import RelationshipLink, { RelationshipLinkConstructor } from './RelationshipLink';
import { Instance } from 'sequelize';

/**
 * Matches an attribute's key name for being a foreign key per Sequelize's
 * conventions. If the key appears to be a foreign key (eg. `movie-id`), the
 * matching JSON API type string is returned. Otherwise returns an empty string.
 *
 * @param {String}
 * @return {String}
 */
function foreignKey(attrKeyName: String): String {
  let match = attrKeyName.match(/([\w-]+)-id/);

  return (match && match[1]) || "";
}

export default class ResourceObject {

  /**
   * Sequelize model instance for this Resource Object
   * 
   * @property {Sequelize.Instance}
   */
  modelInstance: Instance<any, any>;

  /**
   * Constructor.
   *
   * @param modelInstance {Sequelize.Instance}
   */
  constructor(modelInstance: Instance<any, any>) {
    this.modelInstance = modelInstance;
  }

  /**
   * Serialize the model instance's attributes, excluding the model's ID.
   *
   * @param {Array} attributes
   * @return {Object}
   */
  private serializeAttributes(attributes) {
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
  private serializeRelationships(json) {
    let relationships = Object.keys(this.modelInstance.Model.associations);
    let id = String(this.modelInstance.get('id'));
    let originalAttrs = this.modelInstance.attributes;
    let foreignKeys = this.getForeignKeysFromAttrs(originalAttrs);

    if (!relationships.length) {
      return;
    }

    json.relationships = {};

    // Append each relationship to the JSON object
    relationships.forEach(rel => {
      json.relationships[rel] = {
        links: new RelationshipLink(this.modelInstance.getType(), id, rel)
      };

      // If the relationship describes a foreign key, we can serialize that as a
      // Resource Identifier Object
      //
      // @see http://jsonapi.org/format/#document-resource-identifier-objects
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
   * Get foreign keys from an array of attributes
   * 
   * @param {[]String} attrs Array of attributes to extract foreign keys from
   * @return {[]String}
   */
  private getForeignKeysFromAttrs(attrs: Array<String>): Array<String> {
    return attrs
      .map(attr => StringUtils.convertCamelToDasherized(attr))
      .map(attr => foreignKey(attr))
      .filter(attr => !!attr);
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