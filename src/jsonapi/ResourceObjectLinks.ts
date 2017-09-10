'use strict';

import { Instance } from 'sequelize';
import config from './../config/config';
import StringUtils from './../utils/String';

interface ILinksInterface {
  self: string;
}

export default class ResourceObjectLinks {

  /**
   * JSON API links object for this Resource Object
   *
   * @see http://jsonapi.org/format/#document-links
   *
   * @property links
   * @type {ILinksInterface}
   */
  public links: ILinksInterface;

  /**
   * Sequelize model instance to build links for
   *
   * @property modelInstance
   * @type {Sequelize.Instance}
   */
  public modelInstance: Instance<any, any>;

  /**
   * Constructor.
   *
   * @param modelInstance {Sequelize.Instance}
   */
  constructor(modelInstance: Instance<any, any>) {
    this.modelInstance = modelInstance;

    const baseUrl = config.getApiBaseUrl();
    const modelId = this.modelInstance.get('id');
    const modelName = this.modelInstance.getType();
    const modelRoute = StringUtils.convertCamelToDasherized(modelName);

    this.links = {
      self: `${baseUrl}/${modelRoute}/${modelId}`,
    };
  }

  /**
   * Serialize the links object
   *
   * @return {Object}
   */
  public toJSON() {
    return this.links;
  }
}
