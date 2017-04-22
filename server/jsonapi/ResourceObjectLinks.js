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

    let baseUrl = config.getApiBaseUrl();
    let modelId = this.modelInstance.id;
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

module.exports = ResourceObjectLinks;
