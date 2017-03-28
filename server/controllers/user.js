'use strict';

const StringUtils = require('./../utils/String');

class UserController {

  /**
   * Constructor.
   *
   * @param {Eloquent.Instance}
   */
  constructor(model) {
    this.model = model;
  }

  /**
   * Get a single instance of a model
   *
   * @param {String|Number} id Primary ID of the model
   * @return {Promise}
   */
  getOne(id) {
    return new Promise((resolve, reject) => {
      this.model.findById(id).then(foundModel => {
        resolve(foundModel);
      }).catch(function() {
        reject(arguments);
      });
    });
  }

  /**
   * Get a list of model instances
   *
   * @return {Promise}
   */
  getList() {
    return new Promise((resolve, reject) => {
      this.model.findAll().then(foundModels => {
        resolve(foundModels);
      }).catch(function() {
        reject(arguments);
      });
    });
  }

  /**
   * Create a single model instance.
   *
   * @param {Object} attrs Attributes to create the model with
   * @return {Promise}
   */
  createOne(attrs) {
    return new Promise((resolve, reject) => {
      this.model.create(attrs).then(user => {
        resolve(user);
      }).catch(function() {
        reject(arguments);
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
  updateOne(id, attrs) {
    return new Promise((resolve, reject) => {
      this.model.findById(id).then(user => {
        if (!user) {
          return resolve(null);
        }

        let newAttrs = {};

        Object.keys(attrs).forEach(keyName => {
          let camelCaseKey = StringUtils.convertDasherizedToCamelCase(keyName);

          newAttrs[camelCaseKey] = attrs[keyName];
        });

        user.update(newAttrs).then(updatedUser => {
          resolve(updatedUser);
        }).catch(function() {
          reject(arguments);
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
  deleteOne(id) {
    return new Promise((resolve, reject) => {
      this.model.findById(id).then(user => {
        if (!user) {
          return resolve(null);
        }

        user.destroy().then(() => {
          resolve(user);
        }).catch(function() {
          reject(arguments);
        });
      }).catch(() => {
        reject(arguments);
      });
    });
  }

}

module.exports = UserController;
