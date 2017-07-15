'use strict';

import config from './../config/config';

interface LinksInterface {
  self: string;
  related: string;
};

export interface RelationshipLinkConstructor {
  new (modelRoute: string, modelId: string, relationship: string): RelationshipLinkInterface;
}

interface RelationshipLinkInterface {
  toJSON(): any;
}

export default class RelationshipLink implements RelationshipLinkInterface {

  /**
   * Model route name for link
   * 
   * @var {String}
   */
  modelRoute: string;

  /**
   * Model ID for link
   * 
   * @var {String}
   */
  modelId: string;

  /**
   * Relationship name
   * 
   * @var {String}
   */
  relationship: string;

  /**
   * Constructor.
   *
   * @param {String} modelRoute The parent model's route
   * @param {String} modelId The parent model instance's ID
   * @param {String} relationship The name of the relationship to link to
   */
  constructor(modelRoute: string, modelId: string, relationship: string) {
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
    let baseUrl = config.getApiBaseUrl();

    let link: LinksInterface = {
      self: `${baseUrl}/${this.modelRoute}/${this.modelId}/relationships/${this.relationship}`,
      related: `${baseUrl}/${this.modelRoute}/${this.modelId}/${this.relationship}`
    };

    return link;
  }
}