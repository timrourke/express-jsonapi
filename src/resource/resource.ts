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
import GetListRequest from './../jsonapi/GetListRequest';
import NotFoundHandler from './../jsonapi/middleware/not-found-handler';
import parseurl = require('parseurl');
import config from './../config/config';
import Controller, { IControllerConstructor } from './../controllers/controller';
import tryHandlingCrudError from './../jsonapi/errors/tryHandlingCrudError';
import Serializer from './../jsonapi/Serializer';

interface IGetListResult {
  rows: Array<Instance<any, any>>;
  count: number;
}

/**
 * The Resource class builds the JSON API routes for a given Sequelize model,
 * and configures dispatching of actions to that model's controller
 *
 * @class Resource
 */
export default class Resource {

  /**
   * Express application instance
   *
   * @property {Express.Application}
   */
  private app: Application;

  /**
   * Sequelize model class to build resource for
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
   * The controller class this resource should dispatch actions to
   *
   * @property {ControllerConstructor}
   */
  private controllerClass: IControllerConstructor;

  private serializer: Serializer;

  /**
   * Create a JSON API-compliant resource
   *
   * @constructor
   * @param {Express.Application} app The Express application instance
   * @param {Sequelize.Model} model The Sequelize model class to build a resource for
   * @param {ControllerConstructor} controllerClass The controller class to map requests to
   * @param {Serializer} serializer The serializer for JSON API responses
   * @return {void}
   */
  constructor(
    app: Application,
    model: Model<any, any>,
    controllerClass: IControllerConstructor,
    serializer: Serializer,
  ) {
    this.app = app;
    this.model = model;
    this.controllerClass = controllerClass;
    this.modelType = model.getType();
    this.serializer = serializer;
  }

  /**
   * Initilize the resource's route handlers on the Express application instance
   *
   * @method initialize
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
    const parsedUrl  = parseurl(req);

    request.validate().then((sequelizeQueryParams: any) => {
      controller.getList(sequelizeQueryParams).then((getListResult: IGetListResult) => {
        res.json(this.serializer.buildGetListResponse(
          parsedUrl,
          sequelizeQueryParams.offset,
          sequelizeQueryParams.limit,
          getListResult.count,
          getListResult.rows,
        ));
      })
      .catch((err) => {
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
          if (association.isMultiAssociation) {
            // Prepare a request for a to-many related model
            this.handleRelatedRequestToManyResults(
              res,
              relatedPathSegment,
              parentModel,
              relatedModels,
            );
          } else if (!!relatedModels) {
            // Prepare a resopnse for a to-one related model
            this.handleRelatedRequestToOneResult(
              res,
              relatedPathSegment,
              parentModel,
              relatedModels,
            );
          } else {
            // Throw a 404 if no to-one related model is found for this relationship
            NotFoundHandler(req, res, next);
          }
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
   * Create the JSON response for a related request for a to-many relationship
   *
   * @method handleRelatedRequestToManyResults
   * @param {Express.Response} res The Express response
   * @param {String} relatedPathSegment The URL path segment for the relationship
   * @param {Sequelize.Instance} parentModel The parent Sequelize model instance
   * @param {Sequelize.Instance[]} relatedModels The related Sequelize model instances
   */
  private handleRelatedRequestToManyResults(
    res: Response,
    relatedPathSegment: string,
    parentModel: Instance<any, any>,
    relatedModels: Array<Instance<any, any>>,
  ): void {
    const json = this.serializer.buildMultiRelatedResponse(
      relatedPathSegment,
      parentModel,
      relatedModels,
    );

    res.json(json);
  }

  /**
   * Create the JSON response for a related request for a to-one relationship
   *
   * @method handleRelatedRequestToOneResult
   * @param {Express.Response} res The Express response
   * @param {String} relatedPathSegment The URL path segment for the relationship
   * @param {Sequelize.Instance} parentModel The parent Sequelize model instance
   * @param {Sequelize.Instance} relatedModel The related Sequelize model instance
   */
  private handleRelatedRequestToOneResult(
    res: Response,
    relatedPathSegment: string,
    parentModel: Instance<any, any>,
    relatedModel: Instance<any, any>,
  ): void {
    const json = this.serializer.buildSingleRelatedResponse(
      relatedPathSegment,
      parentModel,
      relatedModel,
    );

    res.json(json);
  }

  /**
   * Build a related get list route for a given route's model's relationship
   *
   * @method buildRelatedGetListRoutesForRelationship
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
          let json = {};

          if (association.isMultiAssociation) {
            json = this.serializer.buildRelationshipObjectsMultiResponse(
              relatedPathSegment,
              parentModel,
              relatedModels,
            );
          } else {
            json = this.serializer.buildRelationshipObjectsSingleResponse(
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

      res.json(this.serializer.buildSingleModelResponse(foundModel));
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
      const json = this.serializer.buildSingleModelResponse(newModel);

      res
        .location(json.links.self)
        .status(201)
        .json(json);
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

      res.json(this.serializer.buildSingleModelResponse(updatedModel));
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
