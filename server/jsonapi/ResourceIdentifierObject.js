'use strict';

class ResourceIdentifierObject {

  /**
   * Constructor.
   *
   * @param modelInstance {Sequelize.Instance}
   */
  constructor(modelInstance) {
    this.modelInstance = modelInstance;
  }

  /**
   * Serialize this model instance to JSON API-compliant POJO
   *
   * @return {Object}
   */
  toJSON() {
    let model = this.modelInstance.Model;

    let id = String(this.modelInstance.id);

    let json = {
      type: model.getType(),
      id: id,
    };

    return json;
  }

}

module.exports = ResourceIdentifierObject;
