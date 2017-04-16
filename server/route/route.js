'use strict';

const inflection = require('inflection');
const StringUtils = require('../utils/String');
const JsonApiResourceObject = require('./../jsonapi/ResourceObject');
const JsonApiResourceObjectLinks = require('./../jsonapi/ResourceObjectLinks');
const NotFoundError = require('./../jsonapi/errors/NotFoundError');
const GetListRequest = require('./../jsonapi/GetListRequest');
const JsonApiExtractIncludedModelsAsFlatArray = require('./../jsonapi/extract-included-models-as-flat-array');
const parseurl = require('parseurl');
const config = require('./../config/config');

const REGEX_TO_REMOVE_PAGE_PARAMS = /[\?&]?page\[[\w]+\]=[\d]*&?/g;

class Route {
  /**
   * Create a JSON API-compliant route
   *
   * @constructor
   * @param {Express.Application} app The Express application instance
   * @param {Sequelize.Model} model The Sequelize model class to build routes for
   * @param {Controller} controllerClass The controller class to map requests to
   */
  constructor(app, model, controllerClass) {
    this.app = app;
    this.model = model;
    this.controllerClass = controllerClass;
    this.modelType = model.getType();
  }

  /**
   * Initilize the routes on the app
   */
  initialize() {
    let _this = this;

    this.app.get(`/api/${this.modelType}`, function() {
      _this.handleGetListRequest(...arguments);
    });

    this.app.get(`/api/${this.modelType}/:id`, function() {
      _this.handleGetRequest(...arguments);
    });

    this.app.post(`/api/${this.modelType}`, function() {
      _this.handlePostRequest(...arguments);
    });

    this.app.patch(`/api/${this.modelType}/:id`, function() {
      _this.handlePatchRequest(...arguments);
    });

    this.app.delete(`/api/${this.modelType}/:id`, function() {
      _this.handleDeleteRequest(...arguments);
    });

    Object.keys(this.model.associations).forEach(relationship => {
      let association = this.model.associations[relationship];
      let relatedModel = association.target;
      let relatedModelType = StringUtils.convertCamelToDasherized(relatedModel.name);
      let relatedPathSegment = (association.isMultiAssociation) ?
        inflection.pluralize(relatedModelType) :
        relatedModelType;

      this.app.get(`/api/${this.modelType}/:id/${relatedPathSegment}`, function() {
        _this.handleRelatedGetListRequest(relationship, relatedPathSegment, ...arguments);
      });

      this.app.all(`/api/${this.modelType}/:id/:relationship`, (req, res) => {
        res.status(404).json({
          errors: [
            new NotFoundError(`The relationship "${req.params.relationship}" \
does not exist for ${this.modelType}`)
          ]
        });
      });
    });
  }

  /**
   * Handle a get list request
   *
   * @param {Express.Request} req The Express request
   * @param {Express.Response} res The Express response
   * @param {Function} next The next Express handler/middleware
   */
  handleGetListRequest(req, res, next) {
    let controller = new this.controllerClass(this.model);
    let request    = new GetListRequest(req, this.model);

    request.validate().then(sequelizeQueryParams => {
      controller.getList(sequelizeQueryParams).then(result => {
        let parsedUrl      = parseurl(req);
        let queryParams    = parsedUrl.search || '';
        let count          = result.count;
        let foundModels    = result.rows;
        let json = {
          links: {
            self: `${config.getApiBaseUrl()}/${this.modelType}${queryParams}`
          },
          data: foundModels.map(model => new JsonApiResourceObject(model)),
        };

        Object.assign(
          json.links,
          serializePaginationLinks(count, sequelizeQueryParams, parsedUrl)
        );

        serializeIncludesForJson(foundModels, json);

        res.json(json);
      }).catch(err => {
        next(err, req, res, next);
      });
    }).catch(errors => {
      res.status(400).json({
        errors: errors
      });
    });
  }

  /**
   * Handle a related get list request
   *
   * @param {String} relationship The related model
   * @param {String} relatedPathSegment The URL path segment for the relationship
   * @param {Express.Request} req The Express request
   * @param {Express.Response} res The Express response
   * @param {Function} next The next Express handler/middleware
   */
  handleRelatedGetListRequest(relationship, relatedPathSegment, req, res, next) {
    let association = this.model.associations[relationship];
    let relatedModel = association.target;
    let controller = new this.controllerClass(this.model);
    let request = new GetListRequest(req, relatedModel);
    let accessorMethodName = association.accessors.get;

    controller.getOne(req.params.id).then(foundModel => {
      if (!foundModel) {
        return throwNoModelTypeFoundWithId(req, res, this.modelType);
      }

      request.validate().then(sequelizeQueryParams => {
        foundModel[accessorMethodName](sequelizeQueryParams).then(foundModels => {
          let json = {
            links: {
              self: `${config.getApiBaseUrl()}/${this.modelType}/${foundModel.id}/${relatedPathSegment}`
            },
            data: (association.isMultiAssociation) ?
              foundModels.map(model => new JsonApiResourceObject(model)) :
              new JsonApiResourceObject(foundModels)
          };

          serializeIncludesForJson(foundModels, json);

          res.json(json);
        }).catch(err => {
          next(err, req, res, next);
        });
      }).catch(errors => {
        res.status(400).json({
          errors: errors
        });
      });
    });
  }

  /**
   * Handle a get request
   *
   * @param {Express.Request} req The Express request
   * @param {Express.Response} res The Express response
   * @param {Function} next The next Express handler/middleware
   */
  handleGetRequest(req, res, next) {
    let controller = new this.controllerClass(this.model);

    controller.getOne(req.params.id).then(foundModel => {
      if (!foundModel) {
        return throwNoModelTypeFoundWithId(req, res, this.modelType);
      }

      res.json({
        links: new JsonApiResourceObjectLinks(foundModel),
        data: new JsonApiResourceObject(foundModel)
      });
    }).catch(err => {
      next(err, req, res, next);
    });
  }

  /**
   * Handle a post request
   *
   * @param {Express.Request} req The Express request
   * @param {Express.Response} res The Express response
   * @param {Function} next The next Express handler/middleware
   */
  handlePostRequest(req, res, next) {
    let controller = new this.controllerClass(this.model);
    const attrs = req.body.data.attributes;

    controller.createOne(attrs).then(newModel => {
      res.json({
        links: new JsonApiResourceObjectLinks(newModel),
        data: new JsonApiResourceObject(newModel)
      });
    }).catch(err => {
      next(err, req, res, next);
    });
  }

  /**
   * Handle a patch request
   *
   * @param {Express.Request} req The Express request
   * @param {Express.Response} res The Express response
   * @param {Function} next The next Express handler/middleware
   */
  handlePatchRequest(req, res, next) {
    let controller = new this.controllerClass(this.model);
    const attrs = req.body.data.attributes;

    controller.updateOne(req.params.id, attrs).then(updatedModel => {
      if (!updatedModel) {
        return throwNoModelTypeFoundWithId(req, res, this.modelType);
      }

      res.json({
        links: new JsonApiResourceObjectLinks(updatedModel),
        data: new JsonApiResourceObject(updatedModel)
      });
    }).catch(err => {
      next(err, req, res, next);
    });
  }

  /**
   * Handle a delete request
   *
   * @param {Express.Request} req The Express request
   * @param {Express.Response} res The Express response
   * @param {Function} next The next Express handler/middleware
   */
  handleDeleteRequest(req, res, next) {
    let controller = new this.controllerClass(this.model);

    controller.deleteOne(req.params.id).then(deletedModel => {
      if (!deletedModel) {
        return throwNoModelTypeFoundWithId(req, res, this.modelType);
      }

      res.status(204).end();
    }).catch(err => {
      next(err, req, res, next);
    });
  }
}

/**
 * Serialize includes for JSON response.
 *
 * Extracts and flattens an array of any related models that are nested in the
 * models returned by a Sequelize query, ensuring uniqueness of returned models
 * by type and ID.
 *
 * @param {Sequelize.Model[]} modelArray Array of models to serialize as included
 * @param {Object} json Object to be serialized as JSON response
 */
function serializeIncludesForJson(modelArray, json) {
  let includedModels = [];

  JsonApiExtractIncludedModelsAsFlatArray(modelArray, includedModels);

  if (includedModels.length) {
    json.included = getUniqueModelArray(includedModels)
      .map(model => new JsonApiResourceObject(model));
  }
}

/**
 * Build pagination links for a get list request.
 *
 * @param {Number} count The total count for a given query
 * @param {Object} sequelizeQueryParams The query constraints passed to Sequelize
 * @param {Object} parsedUrl The parsed URL
 * @return {Object}
 */
function serializePaginationLinks(count, sequelizeQueryParams, parsedUrl) {
  let base       = config.getBaseUrl() + parsedUrl.pathname;
  let query      = (parsedUrl.search || '')
    .slice(1)
    .replace(REGEX_TO_REMOVE_PAGE_PARAMS, '');
  let offset     = sequelizeQueryParams.offset;
  let limit      = sequelizeQueryParams.limit;
  let lastOffset = Math.ceil(count/limit);

  if (query) {
    query += '&';
  }

  let baseUrl = `${base}?${query}`;

  let prev = ((offset * limit) - limit > 0) ?
    `${baseUrl}page[offset]=${offset - 1}&page[limit]=${limit}` :
    null;

  let next = ((offset + 1) * limit < count) ?
    `${baseUrl}page[offset]=${offset + 1}&page[limit]=${limit}` :
    null;

  let first = `${baseUrl}page[offset]=0&page[limit]=${limit}`;

  let last  = `${baseUrl}page[offset]=${lastOffset}&page[limit]=${limit}`;

  return {
    first: first,
    last:  last,
    next:  next,
    prev:  prev,
  };
}

/**
 * Throw a 404 error for no model found with an ID
 *
 * @param {Express.Request} req The Express Request object
 * @param {Express.Response} res The Express Response object
 * @param {String} modelType The model type that wasn't found
 */
function throwNoModelTypeFoundWithId(req, res, modelType) {
  res.status(404).json({
    data: null,
    errors: [
      new NotFoundError(`No ${modelType} found with the id of ${req.params.id}`)
    ]
  });
}

/**
 * Takes an array of Sequelize models and returns it without any duplicate
 * models
 *
 * @param {Sequelize.Model[]}
 * @return {Sequelize.Model[]}
 */
function getUniqueModelArray(modelArray) {
  let includedKeys = Object.create(null);
  let uniqueModelArray = [];

  modelArray.forEach(model => {
    let guid = model.name + "_" + model.id;

    if (!(guid in includedKeys)) {
      includedKeys[guid] = true;
      uniqueModelArray.push(model);
    }
  });

  return uniqueModelArray;
}

module.exports = Route;
