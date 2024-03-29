'use strict';

import { Instance } from 'sequelize';

/**
 * Extract included models as a flat array from a Sequelize model array.
 *
 * If a model instance in the array `models` has an association called 'foos',
 * and it has a key of 'foos' defined on the instance, the related 'foo' models
 * will be pushed into the `included` array.
 *
 * @param {Sequelize.Instance|Sequelize.Instance[]} models Sequelize.Instance (or array of them)
 * @param {Array<Instance<any, any>>} included Array of included models to serialize
 * @return {void}
 */
export default function extractIncludedModelsAsFlatArray(models: any, included: Array<Instance<any, any>>): void {
  if (!Array.isArray(models)) {
    models = [models];
  }

  models.forEach((modelInstance) => {
    Object.keys(modelInstance.Model.associations).forEach((association) => {
      if (modelInstance.hasOwnProperty(association)) {
        const includedModels = modelInstance[association];

        if (Array.isArray(includedModels)) {
          includedModels.forEach((model) => included.push(model));
        } else {
          included.push(includedModels);
        }

        extractIncludedModelsAsFlatArray(includedModels, included);
      }
    });
  });
}
