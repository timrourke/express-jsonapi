'use strict';

const inflection = require('inflection');
const StringUtils = require('./../utils/String');
const envConfig = require('./../config/env.json');

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

    let envData = envConfig[process.env.NODE_ENV];

    let host = envData.host;
    let apiBase = envData.apiBase;
    let modelId = this.modelInstance.id;
    let modelName = inflection.pluralize(this.modelInstance.Model.name);
    let modelRoute = StringUtils.convertCamelToDasherized(modelName);

    links.self = `${host}${apiBase}/${modelRoute}/${modelId}`;

    return links;
  }
}

module.exports = ResourceObjectLinks;
