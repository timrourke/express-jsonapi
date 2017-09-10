'use strict';

const inflection = require('inflection');
const StringUtils = require('../utils/String');
import JsonApiResourceObject from './../jsonapi/ResourceObject';
import ResourceIdentifierObject from './../jsonapi/ResourceIdentifierObject';
import JsonApiResourceObjectLinks from './../jsonapi/ResourceObjectLinks';
import NotFoundError from './../jsonapi/errors/NotFoundError';
import NotFoundHandler from './../jsonapi/middleware/not-found-handler';
import GetListRequest from './../jsonapi/GetListRequest';
import extractIncludedModelsAsFlatArray from './../jsonapi/extract-included-models-as-flat-array';
const parseurl = require('parseurl');
import config from './../config/config';
import { 
  Instance, 
  Model
} from 'sequelize';
import { 
  Application,
  NextFunction,
  Request,
  Response 
} from 'express';
import Controller, { ControllerConstructor } from './../controllers/controller';
import tryHandlingCrudError from './../jsonapi/errors/tryHandlingCrudError';

/**
 * Regular expression for removing pagination-related query params from a URL
 * 
 * @property {RegExp}
 * @final
 */
const REGEX_TO_REMOVE_PAGE_PARAMS = /[\?&]?page\[[\w]+\]=[\d]*/g;

/**
 * The Route class builds the JSON API routes for a given Sequelize model, and
 * configures dispatching of actions to that model's controller
 * 
 * @class Route
 */
export default class Route {

  /** 
   * Express application instance
   * 
   * @property {Express.Application}
   */
  app: Application;

  /**
   * The controller class this route should dispatch actions to
   * 
   * @property {ControllerConstructor}
   */
  controllerClass: ControllerConstructor;

  /**
   * Sequelize model class to build routes for
   * 
   * @property {Sequelize.Model}
   */
  model: Model<any, any>;

  /**
   * JSON API model type name
   * 
   * @property {String}
   */
  modelType: string;

  /**
   * Create a JSON API-compliant route
   *
   * @constructor
   * @param {Express.Application} app The Express application instance
   * @param {Sequelize.Model} model The Sequelize model class to build routes for
   * @param {ControllerConstructor} controllerClass The controller class to map requests to
   * @return {void}
   */
  constructor(app: Application, model: Model<any, any>, controllerClass: ControllerConstructor) {
    this.app = app;
    this.model = model;
    this.controllerClass = controllerClass;
    this.modelType = model.getType();
  }

  /**
   * Initilize the routes on the app
   * 
   * @return {void}
   */
  initialize(): void {
    let self = this;

    this.app.get(`/api/${this.modelType}`, function(req: Request, res: Response, next: NextFunction): void {
      self.handleGetListRequest(req, res, next);
    });

    this.app.get(`/api/${this.modelType}/:id`, function(req: Request, res: Response, next: NextFunction): void {
      self.handleGetRequest(req, res, next);
    });

    this.app.post(`/api/${this.modelType}`, function(req: Request, res: Response, next: NextFunction): void {
      self.handlePostRequest(req, res, next);
    });

    this.app.patch(`/api/${this.modelType}/:id`, function(req: Request, res: Response, next: NextFunction): void {
      self.handlePatchRequest(req, res, next);
    });

    this.app.delete(`/api/${this.modelType}/:id`, function(req: Request, res: Response, next: NextFunction): void {
      self.handleDeleteRequest(req, res, next);
    });

    this.app.all(`/api/${this.modelType}/:id/relationships`, function(req: Request, res: Response, next: NextFunction): void {
      NotFoundHandler(req, res, next);
    });

    Object.keys(this.model.associations).forEach(relationship => {
      buildRelatedGetListRoutesForRelationship(this, relationship);
    });
  }

  /**
   * Handle a get list request
   *
   * @param {Express.Request} req The Express request
   * @param {Express.Response} res The Express response
   * @param {Express.NextFunction} next The next Express handler/middleware
   * @return {void}
   */
  handleGetListRequest(req: Request, res: Response, next: NextFunction): void {
    let controller = new this.controllerClass(this.model);
    let request    = new GetListRequest(req, this.model);

    request.validate().then(sequelizeQueryParams => {
      controller.getList(sequelizeQueryParams).then((result: { rows: Array<Instance<any, any>>, count: number }) => {
        let parsedUrl: any      = parseurl(req);
        let queryParams: string = parsedUrl.search || '';
        let count: number       = result.count;
        let foundModels: Array<Instance<any, any>> = result.rows;
        let json = {
          links: {
            self: `${config.getApiBaseUrl()}/${this.modelType}${queryParams}`
          },
          data: foundModels.map((model: Instance<any, any>) => new JsonApiResourceObject(model)),
          meta: {
            total: count
          }
        };

        // Include pagination links in the response payload
        Object.assign(
          json.links,
          serializePaginationLinks(count, sequelizeQueryParams, parsedUrl)
        );

        // Serialize any sideloaded models in the included kay
        serializeIncludesForJson(foundModels, json);

        res.json(json);
      }).catch(err => {
        next(err);
      });
    }).catch(errors => {
      res.status(400).json({
        errors: errors
      });
    });
  }

  /**
   * Handle a related request
   *
   * @method handleRelatedRequest
   * @param {String} relationship The related model
   * @param {String} relatedPathSegment The URL path segment for the relationship
   * @param {Express.Request} req The Express request
   * @param {Express.Response} res The Express response
   * @param {Express.NextFunction} next The next Express handler/middleware
   * @return {void}
   */
  handleRelatedRequest(relationship: string, relatedPathSegment: string, req: Request, res: Response, next: NextFunction): void {
    let association = this.model.associations[relationship];
    let relatedModel = association.target;
    let controller = new this.controllerClass(this.model);
    let request = new GetListRequest(req, relatedModel);
    let accessorMethodName = association.accessors.get;

    controller.getOne(req.params.id).then((parentModel: Instance<any, any>) => {
      if (!parentModel) {
        return throwNoModelTypeFoundWithId(req, res, this.modelType);
      }

      request.validate().then(sequelizeQueryParams => {
        parentModel[accessorMethodName](sequelizeQueryParams).then(relatedModels => {
          let json = {};

          if (association.isMultiAssociation) {
            json = this.buildMultiRelatedResponse(
              relatedPathSegment,
              parentModel,
              relatedModels
            );
          } else {
            json = this.buildSingleRelatedResponse(
              relatedPathSegment,
              parentModel,
              relatedModels
            );
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
  }

  /**
   * Build the JSON response for a related request for a to-one relationship
   * 
   * @param {String} relatedPathSegment The URL path segment for the relationship
   * @param {Sequelize.Instance} parentModel The parent Sequelize model instance
   * @param {Sequelize.Instance} relatedModel The related Sequelize model instance
   * @return {Object}
   */
  private buildSingleRelatedResponse(
    relatedPathSegment: string,
    parentModel: Instance<any, any>,
    relatedModel: Instance<any, any>
  ) {
    let json = {
      links: {
        self: `${config.getApiBaseUrl()}/${this.modelType}/${parentModel.get('id')}/${relatedPathSegment}`,
      },
      data: new JsonApiResourceObject(relatedModel)
    };

    serializeIncludesForJson(relatedModel, json);

    return json;
  }

  /**
   * Build the JSON response for a related request for a to-many relationship
   * 
   * @param {String} relatedPathSegment The URL path segment for the relationship
   * @param {Sequelize.Instance} parentModel The parent Sequelize model instance
   * @param {Sequelize.Instance} relatedModels The related Sequelize model instances
   * @return {Object}
   */
  private buildMultiRelatedResponse(
    relatedPathSegment: string,
    parentModel: Instance<any, any>,
    relatedModels: Array<Instance<any, any>>
  ) {
    let json = {
      links: {
        self: this.buildRelatedLink(parentModel, relatedPathSegment),
      },
      data: relatedModels.map(model => new JsonApiResourceObject(model))
    };

    serializeIncludesForJson(relatedModels, json);

    return json;
  }

  /**
   * Build the `self` link's value for a related request
   * 
   * @param {Sequelize.Instance} parentModel Sequelize model instance to build `self` link for
   * @param {String} relatedPathSegment The URL path segment for the relationship
   * @return {String}
   */
  private buildRelatedLink(parentModel: Instance<any, any>, relatedPathSegment: string): string {
    return `${config.getApiBaseUrl()}/${this.modelType}/${parentModel.get('id')}/${relatedPathSegment}`;
  }

  /**
   * Handle a relationship objects request
   *
   * @param {String} relationship The related model
   * @param {String} relatedPathSegment The URL path segment for the relationship
   * @param {Express.Request} req The Express request
   * @param {Express.Response} res The Express response
   * @param {Express.NextFunction} next The next Express handler/middleware
   * @return {void}
   */
  handleRelationshipObjectsRequest(relationship: string, relatedPathSegment: string, req: Request, res: Response, next: NextFunction): void {
    let association = this.model.associations[relationship];
    let relatedModel = association.target;
    let controller = new this.controllerClass(this.model);
    let request = new GetListRequest(req, relatedModel);
    let accessorMethodName = association.accessors.get;

    controller.getOne(req.params.id).then((parentModel: Instance<any, any>) => {
      if (!parentModel) {
        return throwNoModelTypeFoundWithId(req, res, this.modelType);
      }

      request.validate().then((sequelizeQueryParams: any) => {

        // Resource Identifier Objects only require ID and type attributes
        sequelizeQueryParams.attributes = ['id'];

        parentModel[accessorMethodName](sequelizeQueryParams).then(relatedModels => {
          let json = {
            links: {
              self: `${config.getApiBaseUrl()}/${this.modelType}/${parentModel.get('id')}/relationships/${relatedPathSegment}`,
              related: this.buildRelatedLink(parentModel, relatedPathSegment),
            },
            data: (association.isMultiAssociation) ?
              relatedModels.map(model => new ResourceIdentifierObject(model)) :
              new ResourceIdentifierObject(relatedModels)
          };

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
  }

  /**
   * Handle a get request
   *
   * @param {Express.Request} req The Express request
   * @param {Express.Response} res The Express response
   * @param {Express.NextFunction} next The next Express handler/middleware
   * @return {void}
   */
  handleGetRequest(req: Request, res: Response, next: NextFunction): void {
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
      next(err);
    });
  }

  /**
   * Handle a post request
   *
   * @param {Express.Request} req The Express request
   * @param {Express.Response} res The Express response
   * @param {Express.NextFunction} next The next Express handler/middleware
   * @return {void}
   */
  handlePostRequest(req: Request, res: Response, next: NextFunction): void {
    let controller = new this.controllerClass(this.model);
    const attrs = convertAttrsToCamelCase(req.body.data.attributes);

    controller.createOne(attrs).then(newModel => {
      let links = new JsonApiResourceObjectLinks(newModel);

      res
        .location(links.links.self)
        .status(201)
        .json({
          links: links,
          data: new JsonApiResourceObject(newModel)
        });
    }).catch(err => {
      tryHandlingCrudError(err, this.model).then((errorResponseData: any) => {
        res
          .status(errorResponseData.status)
          .json(errorResponseData.json);
      }).catch(err => {
        next(err);
      });
    });
  }

  /**
   * Handle a patch request
   *
   * @param {Express.Request} req The Express request
   * @param {Express.Response} res The Express response
   * @param {Express.NextFunction} next The next Express handler/middleware
   * @return {void}
   */
  handlePatchRequest(req: Request, res: Response, next: NextFunction): void {
    let controller = new this.controllerClass(this.model);
    const attrs = convertAttrsToCamelCase(req.body.data.attributes);

    controller.updateOne(req.params.id, attrs).then(updatedModel => {
      if (!updatedModel) {
        return throwNoModelTypeFoundWithId(req, res, this.modelType);
      }

      res.json({
        links: new JsonApiResourceObjectLinks(updatedModel),
        data: new JsonApiResourceObject(updatedModel)
      });
    }).catch(err => {
      tryHandlingCrudError(err, this.model).then((errorResponseData: any) => {
        res
          .status(errorResponseData.status)
          .json(errorResponseData.json);
      }).catch(err => {
        next(err);
      });
    });
  }

  /**
   * Handle a delete request
   *
   * @param {Express.Request} req The Express request
   * @param {Express.Response} res The Express response
   * @param {Express.NextFunction} next The next Express handler/middleware
   * @return {void}
   */
  handleDeleteRequest(req: Request, res: Response, next: NextFunction): void {
    let controller = new this.controllerClass(this.model);

    controller.deleteOne(req.params.id).then(deletedModel => {
      if (!deletedModel) {
        return throwNoModelTypeFoundWithId(req, res, this.modelType);
      }

      res.status(204).end();
    }).catch((err: any) => {
      next(err);
    });
  }
}

/**
 * Build a related get list route for a given route's model's relationship
 *
 * @param {Route} route Route instance to define the route handlers for
 * @param {String} relationship Name of the relationship to define route handlers for
 * @return {void}
 */
function buildRelatedGetListRoutesForRelationship(route: Route, relationship: string): void {
  let association = route.model.associations[relationship];
  let relatedModel = association.target;
  let relatedModelType = StringUtils.convertCamelToDasherized(relatedModel.name);
  let relatedPathSegment = (association.isMultiAssociation) ?
    inflection.pluralize(relatedModelType) :
    relatedModelType;

  // Define a handler for getting relationship objects for the relationship
  route.app.get(`/api/${route.modelType}/:id/relationships/${relatedPathSegment}`,
    function(req: Request, res: Response, next: NextFunction): void {
    route.handleRelationshipObjectsRequest(
      relationship,
      relatedPathSegment,
      req,
      res,
      next
    );
  });

  // Define a general 404 handler for non-existent relationships
  route.app.all(`/api/${route.modelType}/:id/relationships/:relationship`, (req: Request, res: Response): void => {
    let msg = `The relationship "${req.params.relationship}" does not exist for ${route.modelType}`;

    res.status(404).json({
      errors: [
        new NotFoundError(msg)
      ]
    });
  });

  // Define a handler for getting the related objects themselves
  route.app.get(`/api/${route.modelType}/:id/${relatedPathSegment}`,
    function(req: Request, res: Response, next: NextFunction): void {
    route.handleRelatedRequest(
      relationship,
      relatedPathSegment,
      req,
      res,
      next
    );
  });

  // Define a general 404 handler for non-existent relationships
  route.app.all(`/api/${route.modelType}/:id/:relationship`, (req: Request, res: Response): void => {
    let msg = `The relationship "${req.params.relationship}" does not exist for ${route.modelType}`;

    res.status(404).json({
      errors: [
        new NotFoundError(msg)
      ]
    });
  });

}

/**
 * Convert keynames in attributes object from dasherized to camel case
 *
 * @param {Object} attrs Attributes object
 * @return {Object}
 */
function convertAttrsToCamelCase(attrs: any): any {
  let camelCaseAttrs = {};

  Object.keys(attrs).forEach((keyName: string) => {
    let camelCaseKey = StringUtils.convertDasherizedToCamelCase(keyName);

    camelCaseAttrs[camelCaseKey] = attrs[keyName];
  });

  return camelCaseAttrs;
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

  extractIncludedModelsAsFlatArray(modelArray, includedModels);

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
function serializePaginationLinks(count: number, sequelizeQueryParams: any, parsedUrl: any) {
  let base       = config.getBaseUrl() + parsedUrl.pathname;
  let query      = (parsedUrl.search || '')
    .slice(1)
    .replace(REGEX_TO_REMOVE_PAGE_PARAMS, '');
  let offset     = sequelizeQueryParams.offset;
  let limit      = sequelizeQueryParams.limit;
  let lastOffset = Math.floor(count/limit) * limit;

  if (query) {
    query += '&';
  }

  let baseUrl = `${base}?${query}`;

  let prev = (offset - limit > 0) ?
    `${baseUrl}page[offset]=${offset - limit}&page[limit]=${limit}` :
    null;

  let next = offset + limit <= lastOffset ?
    `${baseUrl}page[offset]=${offset + limit}&page[limit]=${limit}` :
    null;

  let first = `${baseUrl}page[offset]=0&page[limit]=${limit}`;

  let last = `${baseUrl}page[offset]=${lastOffset}&page[limit]=${limit}`;

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
function throwNoModelTypeFoundWithId(req: Request, res: Response, modelType: string): void {
  let error = new NotFoundError(`No ${modelType} found with the id of ${req.params.id}`);

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
function getUniqueModelArray(modelArray: Array<any>): Array<any> {
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
