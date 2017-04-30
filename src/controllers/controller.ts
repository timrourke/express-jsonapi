'use strict';

import { Instance, Model } from 'sequelize';

export interface ControllerConstructor {
  new (model: Model<any, any>): ControllerInterface;
}

interface ControllerInterface {
  getOne(id): Promise<Instance<any, any>>;

  getList(sequelizeQueryParams): Promise<Array<Instance<any, any>>>;

  createOne(attrs: any): Promise<Instance<any, any>>;

  updateOne(id, attrs: any): Promise<Instance<any, any>>;

  deleteOne(id): Promise<Instance<any, any>>;
}

export default class Controller implements ControllerInterface {

  model: Model<any, any>;

  /**
   * Constructor.
   *
   * @param {Sequelize.Model}
   */
  constructor(model: Model<any, any>) {
    this.model = model;
  }

  /**
   * Get a single instance of a model
   *
   * @param {String|Number} id Primary ID of the model
   * @return {Promise}
   */
  getOne(id): Promise<Instance<any, any>> {
    return new Promise((resolve: Function, reject: Function) => {
      this.model.findById(id).then((foundModel: Instance<any, any>) => {
        resolve(foundModel);
      }).catch((error: Error) => {
        reject(error);
      });
    });
  }

  /**
   * Get a list of model instances
   *
   * @param {Object} sequelizeQueryParams The query params to pass to the query builder
   * @return {Promise}
   */
  getList(sequelizeQueryParams = {}): Promise<Array<Instance<any, any>>> {
    return new Promise((resolve: Function, reject: Function) => {
      this.model.findAndCountAll(sequelizeQueryParams).then(result => {
        resolve(result);
      }).catch((error: Error) => {
        reject(error);
      });
    });
  }

  /**
   * Create a single model instance.
   *
   * @param {Object} attrs Attributes to create the model with
   * @return {Promise}
   */
  createOne(attrs: any): Promise<Instance<any, any>> {
    return new Promise((resolve: Function, reject: Function) => {
      this.model.create(attrs).then((newModel: Instance<any, any>) => {
        resolve(newModel);
      }).catch((error: Error) => {
        reject(error);
      });
    });
  }

  /**
   * Update a single model instance. Resolves with a null value
   * if the model cannot be found by the provided ID.
   *
   * @param {String|Number} id Primary ID of the model
   * @param {Object} attrs Attributes to update on the model
   * @return {Promise}
   */
  updateOne(id, attrs: any): Promise<Instance<any, any>> {
    return new Promise((resolve: Function, reject: Function) => {
      this.model.findById(id).then((foundModel: Instance<any, any>) => {
        if (!foundModel) {
          return resolve(null);
        }

        foundModel.update(attrs).then((updatedModel: Instance<any, any>) => {
          resolve(updatedModel);
        }).catch((error: Error) => {
          reject(error);
        });
      }).catch(function() {
        reject(arguments);
      });
    });
  }

  /**
   * Delete a single model instance by ID. Resolves with a null value if the
   * model cannot be found by the provided ID.
   *
   * @param {String|Number} id Primary ID of the model
   * @return {Promise}
   */
  deleteOne(id): Promise<Instance<any, any>> {
    return new Promise((resolve: Function, reject: Function) => {
      this.model.findById(id).then((foundModel: Instance<any, any>) => {
        if (!foundModel) {
          return resolve(null);
        }

        foundModel.destroy().then(() => {
          resolve(foundModel);
        }).catch((error: Error) => {
          reject(error);
        });
      }).catch((error: Error) => {
        reject(error);
      });
    });
  }

}
