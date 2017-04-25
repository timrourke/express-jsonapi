'use strict';

const config = require('./../config/config');

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
    let baseUrl = config.getApiBaseUrl();

    link.self = `${baseUrl}/${this.modelRoute}/${this.modelId}/relationships/${this.relationship}`;
    link.related = `${baseUrl}/${this.modelRoute}/${this.modelId}/${this.relationship}`;

    return link;
  }
}

module.exports = RelationshipLink;
