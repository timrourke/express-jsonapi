'use strict';

import config from './../config/config';

interface ILinksInterface {
  self: string;
  related: string;
}

export interface IRelationshipLinkConstructor {
  new (modelRoute: string, modelId: string, relationship: string): IRelationshipLinkInterface;
}

interface IRelationshipLinkInterface {
  toJSON(): any;
}

export default class RelationshipLink implements IRelationshipLinkInterface {

  /**
   * Model route name for link
   *
   * @property modelRoute
   * @type {String}
   */
  private modelRoute: string;

  /**
   * Model ID for link
   *
   * @property modelId
   * @type {String}
   */
  private modelId: string;

  /**
   * Relationship name
   *
   * @property relationship
   * @type {String}
   */
  private relationship: string;

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
  public toJSON() {
    const baseUrl = config.getApiBaseUrl();

    const link: ILinksInterface = {
      related: `${baseUrl}/${this.modelRoute}/${this.modelId}/${this.relationship}`,
      self: `${baseUrl}/${this.modelRoute}/${this.modelId}/relationships/${this.relationship}`,
    };

    return link;
  }
}
