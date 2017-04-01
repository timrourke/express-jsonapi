'use strict';

const inflection = require('inflection');
const envConfig = require('./../config/env.json');

class RelationshipLink {

  /**
   * Constructor.
   *
   * @param {String} modelRoute The parent model's route
   * @param {String} modelId The parent model instance's ID
   * @param {String} relationship The name of the relationship to link to
   */
  constructor(modelRoute, modelId, relationship) {
    this.modelRoute = modelRoute;
    this.modelId = modelId;
    this.relationship = relationship;
  }

  /**
   * Serialize the link object
   *
   * @return {Object}
   */
  toJSON() {
    let link = {};

    let envData = envConfig[process.env.NODE_ENV];

    let host = envData.host;
    let apiBase = envData.apiBase;

    link.self = `${host}${apiBase}/${this.modelRoute}/${this.modelId}/relationships/${this.relationship}`;
    link.related = `${host}${apiBase}/${this.modelRoute}/${this.modelId}/${this.relationship}`;

    return link;
  }
}

module.exports = RelationshipLink;
