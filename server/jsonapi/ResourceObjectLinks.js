'use strict';

const StringUtils = require('./../utils/String');
const config = require('./../config/config');

class ResourceObjectLinks {

  /**
   * Constructor.
   *
   * @param modelInstance {Sequelize.Instance}
   */
  constructor(modelInstance) {
    this.modelInstance = modelInstance;
  }

  /**
   * Serialize the links object
   *
   * @return {Object}
   */
  toJSON() {
    let links = {};

    let baseUrl = config.getApiBaseUrl();
    let modelId = this.modelInstance.id;
    let modelName = this.modelInstance.getType();
    let modelRoute = StringUtils.convertCamelToDasherized(modelName);

    links.self = `${baseUrl}/${modelRoute}/${modelId}`;

    return links;
  }
}

module.exports = ResourceObjectLinks;
