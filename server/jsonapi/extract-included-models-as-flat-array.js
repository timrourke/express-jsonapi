'use strict';

/**
 * Extract included models as a flat array from a Sequelize model array
 *
 * @param {Sequelize.Model|Array} models Model or models returned from Sequelize
 * @param {Array} included Array of included models to serialize
 */
function extractIncludedModelsAsFlatArray(models, included) {
  if (!Array.isArray(models)) {
    models = [models];
  }

  models.forEach(modelInstance => {
    Object.keys(modelInstance.Model.associations).forEach(association => {
      if (modelInstance.hasOwnProperty(association)) {
        let includedModels = modelInstance[association];

        if (Array.isArray(includedModels)) {
          includedModels.forEach(model => included.push(model));
        } else {
          included.push(includedModels);
        }

        extractIncludedModelsAsFlatArray(includedModels, included);
      }
    });
  });
}

module.exports = extractIncludedModelsAsFlatArray;

