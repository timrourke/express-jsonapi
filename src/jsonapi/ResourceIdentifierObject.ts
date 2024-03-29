import { Instance } from 'sequelize';

/**
 * ResourceIdentifierObject is a JSON API Resource Identifier Object
 *
 * @see http://jsonapi.org/format/#document-resource-identifier-objects
 *
 * @class ResourceIdentifierObject
 */
export default class ResourceIdentifierObject {

  /**
   * The Sequelize model instance for this Resource Identifier Object
   *
   * @property modelInstance
   * @type {Sequelize.Instance}
   * @private
   */
  private modelInstance: Instance<any, any>;

  /**
   * Constructor.
   *
   * @param {Sequelize.Instance} modelInstance
   */
  public constructor(modelInstance: Instance<any, any>) {
    this.modelInstance = modelInstance;
  }

  /**
   * Serialize this model instance to be JSON API-compliant
   *
   * @return {Object}
   */
  public toJSON(): any {
    const model = this.modelInstance.Model;

    const id = String(this.modelInstance.get('id'));

    const json = {
      id,
      type: model.getType(),
    };

    return json;
  }

}
