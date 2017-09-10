'use strict';

import { Instance, Model } from 'sequelize';

export interface IControllerConstructor {
  new (model: Model<any, any>): IControllerInterface;
}

interface IControllerInterface {
  getOne(id): Promise<Instance<any, any>>;

  getList(sequelizeQueryParams): Promise<{ rows: Array<Instance<any, any>>, count: number }>;

  createOne(attrs: any): Promise<Instance<any, any>>;

  updateOne(id, attrs: any): Promise<Instance<any, any>>;

  deleteOne(id): Promise<Instance<any, any>>;
}

export default class Controller implements IControllerInterface {

  /**
   * The primary model for the controller
   *
   * @property model
   * @type {Sequelize.Model<any, any>}
   */
  private model: Model<any, any>;

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
  public getOne(id): Promise<Instance<any, any>> {
    return new Promise((resolve: (foundModel: Instance<any, any>) => void, reject: (error: Error) => void) => {
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
  public getList(sequelizeQueryParams = {}): Promise<{ rows: any[], count: number }> {
    return new Promise((resolve: (result) => void, reject: (error: Error) => void) => {
      this.model.findAndCountAll(sequelizeQueryParams).then((result) => {
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
  public createOne(attrs: any): Promise<Instance<any, any>> {
    return new Promise((resolve: (newModel: Instance<any, any>) => void, reject: (error: Error) => void) => {
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
  public updateOne(id, attrs: any): Promise<Instance<any, any>> {
    return new Promise((resolve: (updatedModel: Instance<any, any>) => void, reject: (error: Error) => void) => {
      this.model.findById(id).then((foundModel: Instance<any, any>) => {
        if (!foundModel) {
          return resolve(null);
        }

        foundModel.update(attrs).then((updatedModel: Instance<any, any>) => {
          resolve(updatedModel);
        }).catch((error: Error) => {
          reject(error);
        });
      }).catch((error) => {
        reject(error);
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
  public deleteOne(id): Promise<Instance<any, any>> {
    return new Promise((resolve: (deletedModel: Instance<any, any>) => void, reject: (error: Error) => void) => {
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
