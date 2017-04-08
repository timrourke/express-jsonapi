'use strict';

const inflection = require('inflection');
const StringUtils = require('../utils/String');
const JsonApiResourceObject = require('./../jsonapi/ResourceObject');
const JsonApiResourceObjectLinks = require('./../jsonapi/ResourceObjectLinks');
const NotFoundError = require('./../jsonapi/errors/NotFoundError');
const GetListRequest = require('./../jsonapi/GetListRequest');
const JsonApiExtractIncludedModelsAsFlatArray = require('./../jsonapi/extract-included-models-as-flat-array');

function createRoute(app, model, controllerClass) {
  const modelType = inflection.pluralize(
    StringUtils.convertCamelToDasherized(model.name)
  );

  app.get(`/api/${modelType}`, function(req, res, next) {
    let controller = new controllerClass(model);
    let request = new GetListRequest(req, model);

    request.validate().then(sequelizeQueryParams => {
      controller.getList(sequelizeQueryParams).then(foundModels => {
        let json = {
          links: {
            self: `http://localhost:3000/api/${modelType}`
          },
          data: foundModels.map(model => new JsonApiResourceObject(model))
        };

        let included = [];

        JsonApiExtractIncludedModelsAsFlatArray(foundModels, included);

        if (included.length) {
          json.included = included.map(model => new JsonApiResourceObject(model));
        }

        res.json(json);
      }).catch(err => {
        next(err);
      });
    }).catch(errors => {
      res.status(400).json({
        errors: errors
      });
    });
  });

  app.get(`/api/${modelType}/:id`, function(req, res, next) {
    let controller = new controllerClass(model);

    controller.getOne(req.params.id).then(foundModel => {
      if (!foundModel) {
        return res.status(404).json({
          data: null,
          errors: [
            new NotFoundError(`No ${modelType} found with the id of ${req.params.id}`)
          ]
        });
      }

      res.json({
        links: new JsonApiResourceObjectLinks(foundModel),
        data: new JsonApiResourceObject(foundModel)
      });
    }).catch(err => {
      next(err);
    });
  });

  app.post(`/api/${modelType}`, function(req, res, next) {
    let controller = new controllerClass(model);
    const attrs = req.body.data.attributes;

    controller.createOne(attrs).then(foundModel => {
      res.json({
        links: new JsonApiResourceObjectLinks(foundModel),
        data: {
          type: modelType,
          attributes: foundModel
        }
      });
    }).catch(err => {
      next(err);
    });
  });

  app.patch(`/api/${modelType}/:id`, function(req, res, next) {
    let controller = new controllerClass(model);
    const attrs = req.body.data.attributes;

    controller.updateOne(req.params.id, attrs).then(updatedModel => {
      if (!updatedModel) {
        return res.status(404).json({
          data: null,
          errors: [
            new NotFoundError(`No ${modelType} found with the id of ${req.params.id}`)
          ]
        });
      }

      res.json({
        links: new JsonApiResourceObjectLinks(updatedModel),
        data: new JsonApiResourceObject(updatedModel)
      });
    }).catch(err => {
      next(err);
    });
  });

  app.delete(`/api/${modelType}/:id`, function(req, res, next) {
    let controller = new controllerClass(model);

    controller.deleteOne(req.params.id).then(deletedModel => {
      if (!deletedModel) {
        return res.status(404).json({
          data: null,
          errors: [
            new NotFoundError(`No ${modelType} found with the id of ${req.params.id}`)
          ]
        });
      }

      res.status(204).end();
    }).catch(err => {
      next(err);
    });
  });
}

module.exports = createRoute;
