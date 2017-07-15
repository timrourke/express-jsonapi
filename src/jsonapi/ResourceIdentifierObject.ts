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
   * @property {Sequelize.Instance}
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
    let model = this.modelInstance.Model;

    let id = String(this.modelInstance.get('id'));

    let json = {
      type: model.getType(),
      id: id,
    };

    return json;
  }

}