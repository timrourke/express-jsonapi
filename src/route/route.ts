'use strict';

import inflection = require('inflection');
import {
  Application,
  NextFunction,
  Request,
  Response,
} from 'express';
import { Instance, Model } from 'sequelize';
import StringUtils from '../utils/String';
import NotFoundError from './../jsonapi/errors/NotFoundError';
import extractIncludedModelsAsFlatArray from './../jsonapi/extract-included-models-as-flat-array';
import GetListRequest from './../jsonapi/GetListRequest';
import NotFoundHandler from './../jsonapi/middleware/not-found-handler';
import ResourceIdentifierObject from './../jsonapi/ResourceIdentifierObject';
import JsonApiResourceObject from './../jsonapi/ResourceObject';
import JsonApiResourceObjectLinks from './../jsonapi/ResourceObjectLinks';
import parseurl = require('parseurl');
import config from './../config/config';
import Controller, { IControllerConstructor } from './../controllers/controller';
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
  private app: Application;

  /**
   * Sequelize model class to build routes for
   *
   * @property {Sequelize.Model}
   */
  private model: Model<any, any>;

  /**
   * JSON API model type name
   *
   * @property {String}
   */
  private modelType: string;

  /**
   * The controller class this route should dispatch actions to
   *
   * @property {ControllerConstructor}
   */
  private controllerClass: IControllerConstructor;

  /**
   * Create a JSON API-compliant route
   *
   * @constructor
   * @param {Express.Application} app The Express application instance
   * @param {Sequelize.Model} model The Sequelize model class to build routes for
   * @param {ControllerConstructor} controllerClass The controller class to map requests to
   * @return {void}
   */
  constructor(app: Application, model: Model<any, any>, controllerClass: IControllerConstructor) {
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
  public initialize(): void {
    this.app.get(`/api/${this.modelType}`, (req: Request, res: Response, next: NextFunction): void => {
      this.handleGetListRequest(req, res, next);
    });

    this.app.get(`/api/${this.modelType}/:id`, (req: Request, res: Response, next: NextFunction): void => {
      this.handleGetRequest(req, res, next);
    });

    this.app.post(`/api/${this.modelType}`, (req: Request, res: Response, next: NextFunction): void => {
      this.handlePostRequest(req, res, next);
    });

    this.app.patch(`/api/${this.modelType}/:id`, (req: Request, res: Response, next: NextFunction): void => {
      this.handlePatchRequest(req, res, next);
    });

    this.app.delete(`/api/${this.modelType}/:id`, (req: Request, res: Response, next: NextFunction): void => {
      this.handleDeleteRequest(req, res, next);
    });

    this.app.all(`/api/${this.modelType}/:id/relationships`,
      (req: Request, res: Response, next: NextFunction): void => {
        NotFoundHandler(req, res, next);
      });

    Object.keys(this.model.associations).forEach((relationship) => {
      this.buildRelatedGetListRoutesForRelationship(relationship);
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
  private handleGetListRequest(req: Request, res: Response, next: NextFunction): void {
    const controller = new this.controllerClass(this.model);
    const request    = new GetListRequest(req, this.model);

    request.validate().then((sequelizeQueryParams) => {
      controller.getList(sequelizeQueryParams).then((result: { rows: Array<Instance<any, any>>, count: number }) => {
        const parsedUrl: any      = parseurl(req);
        const queryParams: string = parsedUrl.search || '';
        const count: number       = result.count;
        const foundModels: Array<Instance<any, any>> = result.rows;
        const json = {
          data: foundModels.map((model: Instance<any, any>) => new JsonApiResourceObject(model)),
          links: {
            self: `${config.getApiBaseUrl()}/${this.modelType}${queryParams}`,
          },
          meta: {
            total: count,
          },
        };

        // Include pagination links in the response payload
        Object.assign(
          json.links,
          serializePaginationLinks(count, sequelizeQueryParams, parsedUrl),
        );

        // Serialize any sideloaded models in the included kay
        serializeIncludesForJson(foundModels, json);

        res.json(json);
      }).catch((err) => {
        next(err);
      });
    }).catch((errors) => {
      res.status(400).json({
        errors,
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
  private handleRelatedRequest(
    relationship: string,
    relatedPathSegment: string,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const association = this.model.associations[relationship];
    const relatedModel = association.target;
    const controller = new this.controllerClass(this.model);
    const request = new GetListRequest(req, relatedModel);
    const accessorMethodName = association.accessors.get;

    controller.getOne(req.params.id).then((parentModel: Instance<any, any>) => {
      if (!parentModel) {
        return throwNoModelTypeFoundWithId(req, res, this.modelType);
      }

      request.validate().then((sequelizeQueryParams) => {
        parentModel[accessorMethodName](sequelizeQueryParams).then((relatedModels) => {
          let json = {};

          if (association.isMultiAssociation) {
            json = this.buildMultiRelatedResponse(
              relatedPathSegment,
              parentModel,
              relatedModels,
            );
          } else {
            json = this.buildSingleRelatedResponse(
              relatedPathSegment,
              parentModel,
              relatedModels,
            );
          }

          res.json(json);
        }).catch((err) => {
          next(err);
        });
      }).catch((errors) => {
        res.status(400).json({
          errors,
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
    relatedModel: Instance<any, any>,
  ) {
    const json = {
      data: new JsonApiResourceObject(relatedModel),
      links: {
        self: `${config.getApiBaseUrl()}/${this.modelType}/${parentModel.get('id')}/${relatedPathSegment}`,
      },
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
    relatedModels: Array<Instance<any, any>>,
  ) {
    const json = {
      data: relatedModels.map((model) => new JsonApiResourceObject(model)),
      links: {
        self: this.buildRelatedLink(parentModel, relatedPathSegment),
      },
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
   * Build a related get list route for a given route's model's relationship
   *
   * @param {Route} route Route instance to define the route handlers for
   * @param {String} relationship Name of the relationship to define route handlers for
   * @return {void}
   */
  private buildRelatedGetListRoutesForRelationship(relationship: string): void {
    const association = this.model.associations[relationship];
    const relatedModel = association.target;
    const relatedModelType = StringUtils.convertCamelToDasherized(relatedModel.name);
    const relatedPathSegment = (association.isMultiAssociation) ?
      inflection.pluralize(relatedModelType) :
      relatedModelType;

    // Define a handler for getting relationship objects for the relationship
    this.app.get(`/api/${this.modelType}/:id/relationships/${relatedPathSegment}`,
      (req: Request, res: Response, next: NextFunction): void => {
      this.handleRelationshipObjectsRequest(
        relationship,
        relatedPathSegment,
        req,
        res,
        next,
      );
    });

    // Define a general 404 handler for non-existent relationships
    this.app.all(`/api/${this.modelType}/:id/relationships/:relationship`, (req: Request, res: Response): void => {
      const msg = `The relationship "${req.params.relationship}" does not exist for ${this.modelType}`;

      res.status(404).json({
        errors: [
          new NotFoundError(msg),
        ],
      });
    });

    // Define a handler for getting the related objects themselves
    this.app.get(`/api/${this.modelType}/:id/${relatedPathSegment}`,
      (req: Request, res: Response, next: NextFunction): void => {
      this.handleRelatedRequest(
        relationship,
        relatedPathSegment,
        req,
        res,
        next,
      );
    });

    // Define a general 404 handler for non-existent relationships
    this.app.all(`/api/${this.modelType}/:id/:relationship`, (req: Request, res: Response): void => {
      const msg = `The relationship "${req.params.relationship}" does not exist for ${this.modelType}`;

      res.status(404).json({
        errors: [
          new NotFoundError(msg),
        ],
      });
    });

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
  private handleRelationshipObjectsRequest(
    relationship: string,
    relatedPathSegment: string,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const association = this.model.associations[relationship];
    const relatedModel = association.target;
    const controller = new this.controllerClass(this.model);
    const request = new GetListRequest(req, relatedModel);
    const accessorMethodName = association.accessors.get;

    controller.getOne(req.params.id).then((parentModel: Instance<any, any>) => {
      if (!parentModel) {
        return throwNoModelTypeFoundWithId(req, res, this.modelType);
      }

      request.validate().then((sequelizeQueryParams: any) => {

        // Resource Identifier Objects only require ID and type attributes
        sequelizeQueryParams.attributes = ['id'];

        parentModel[accessorMethodName](sequelizeQueryParams).then((relatedModels) => {
          const json = {
            data: (association.isMultiAssociation) ?
              relatedModels.map((model) => new ResourceIdentifierObject(model)) :
              new ResourceIdentifierObject(relatedModels),
            links: {
              related: this.buildRelatedLink(parentModel, relatedPathSegment),
              self: `${config.getApiBaseUrl()}/${this.modelType}/${parentModel.get('id')}/relationships/${relatedPathSegment}`,
            },
          };

          res.json(json);
        }).catch((err) => {
          next(err);
        });
      }).catch((errors) => {
        res.status(400).json({
          errors,
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
  private handleGetRequest(req: Request, res: Response, next: NextFunction): void {
    const controller = new this.controllerClass(this.model);

    controller.getOne(req.params.id).then((foundModel) => {
      if (!foundModel) {
        return throwNoModelTypeFoundWithId(req, res, this.modelType);
      }

      res.json({
        data: new JsonApiResourceObject(foundModel),
        links: new JsonApiResourceObjectLinks(foundModel),
      });
    }).catch((err) => {
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
  private handlePostRequest(req: Request, res: Response, next: NextFunction): void {
    const controller = new this.controllerClass(this.model);
    const attrs = convertAttrsToCamelCase(req.body.data.attributes);

    controller.createOne(attrs).then((newModel) => {
      const links = new JsonApiResourceObjectLinks(newModel);

      res
        .location(links.links.self)
        .status(201)
        .json({
          data: new JsonApiResourceObject(newModel),
          links,
        });
    }).catch((err) => {
      tryHandlingCrudError(err, this.model).then((errorResponseData: any) => {
        res
          .status(errorResponseData.status)
          .json(errorResponseData.json);
      }).catch((err2) => {
        next(err2);
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
  private handlePatchRequest(req: Request, res: Response, next: NextFunction): void {
    const controller = new this.controllerClass(this.model);
    const attrs = convertAttrsToCamelCase(req.body.data.attributes);

    controller.updateOne(req.params.id, attrs).then((updatedModel) => {
      if (!updatedModel) {
        return throwNoModelTypeFoundWithId(req, res, this.modelType);
      }

      res.json({
        data: new JsonApiResourceObject(updatedModel),
        links: new JsonApiResourceObjectLinks(updatedModel),
      });
    }).catch((err) => {
      tryHandlingCrudError(err, this.model).then((errorResponseData: any) => {
        res
          .status(errorResponseData.status)
          .json(errorResponseData.json);
      }).catch((err2) => {
        next(err2);
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
  private handleDeleteRequest(req: Request, res: Response, next: NextFunction): void {
    const controller = new this.controllerClass(this.model);

    controller.deleteOne(req.params.id).then((deletedModel) => {
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
 * Convert keynames in attributes object from dasherized to camel case
 *
 * @param {Object} attrs Attributes object
 * @return {Object}
 */
function convertAttrsToCamelCase(attrs: any): any {
  const camelCaseAttrs = {};

  Object.keys(attrs).forEach((keyName: string) => {
    const camelCaseKey = StringUtils.convertDasherizedToCamelCase(keyName);

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
  const includedModels = [];

  extractIncludedModelsAsFlatArray(modelArray, includedModels);

  if (includedModels.length) {
    json.included = getUniqueModelArray(includedModels)
      .map((model) => new JsonApiResourceObject(model));
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
  const base       = config.getBaseUrl() + parsedUrl.pathname;
  let query      = (parsedUrl.search || '')
    .slice(1)
    .replace(REGEX_TO_REMOVE_PAGE_PARAMS, '');
  const offset     = sequelizeQueryParams.offset;
  const limit      = sequelizeQueryParams.limit;
  const lastOffset = Math.floor(count / limit) * limit;

  if (query) {
    query += '&';
  }

  const baseUrl = `${base}?${query}`;

  const prev = (offset - limit > 0) ?
    `${baseUrl}page[offset]=${offset - limit}&page[limit]=${limit}` :
    null;

  const next = offset + limit <= lastOffset ?
    `${baseUrl}page[offset]=${offset + limit}&page[limit]=${limit}` :
    null;

  const first = `${baseUrl}page[offset]=0&page[limit]=${limit}`;

  const last = `${baseUrl}page[offset]=${lastOffset}&page[limit]=${limit}`;

  return {
    first,
    last,
    next,
    prev,
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
  const error = new NotFoundError(`No ${modelType} found with the id of ${req.params.id}`);

  res.status(404).json({
    data: null,
    errors: [
      new NotFoundError(`No ${modelType} found with the id of ${req.params.id}`),
    ],
  });
}

/**
 * Takes an array of Sequelize models and returns it without any duplicate
 * models
 *
 * @param {Sequelize.Model[]}
 * @return {Sequelize.Model[]}
 */
function getUniqueModelArray(modelArray: any[]): any[] {
  const includedKeys = Object.create(null);
  const uniqueModelArray = [];

  modelArray.forEach((model) => {
    const guid = model.name + '_' + model.id;

    if (!(guid in includedKeys)) {
      includedKeys[guid] = true;
      uniqueModelArray.push(model);
    }
  });

  return uniqueModelArray;
}
