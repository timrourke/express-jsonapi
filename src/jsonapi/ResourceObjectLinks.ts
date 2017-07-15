'use strict';

const StringUtils = require('./../utils/String');
import config from './../config/config';
import { Instance } from 'sequelize';

interface LinksInterface {
  self: string;
}

export default class ResourceObjectLinks {

  /**
   * JSON API links object for this Resource Object
   * 
   * @see http://jsonapi.org/format/#document-links
   */
  links: LinksInterface;

  /**
   * Sequelize model instance to build links for
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

    let baseUrl = config.getApiBaseUrl();
    let modelId = this.modelInstance.get('id');
    let modelName = this.modelInstance.getType();
    let modelRoute = StringUtils.convertCamelToDasherized(modelName);

    this.links = {
      self: `${baseUrl}/${modelRoute}/${modelId}`
    };
  }

  /**
   * Serialize the links object
   *
   * @return {Object}
   */
  toJSON() {
    return this.links;
  }
}