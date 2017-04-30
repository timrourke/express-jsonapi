'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const inflection = require('inflection');
const StringUtils = require('../utils/String');
const JsonApiResourceObject = require('./../jsonapi/ResourceObject');
const JsonApiResourceIdentifierObject = require('./../jsonapi/ResourceIdentifierObject');
const JsonApiResourceObjectLinks = require('./../jsonapi/ResourceObjectLinks');
const NotFoundError = require('./../jsonapi/errors/NotFoundError');
const not_found_handler_1 = require("./../jsonapi/middleware/not-found-handler");
const GetListRequest = require('./../jsonapi/GetListRequest');
const JsonApiExtractIncludedModelsAsFlatArray = require('./../jsonapi/extract-included-models-as-flat-array');
const parseurl = require('parseurl');
const config_1 = require("./../config/config");
const tryHandlingCrudError = require('./../jsonapi/errors/tryHandlingCrudError');
const REGEX_TO_REMOVE_PAGE_PARAMS = /[\?&]?page\[[\w]+\]=[\d]*/g;
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
        this.app.get(`/api/${this.modelType}`, function (req, res, next) {
            _this.handleGetListRequest(req, res, next);
        });
        this.app.get(`/api/${this.modelType}/:id`, function (req, res, next) {
            _this.handleGetRequest(req, res, next);
        });
        this.app.post(`/api/${this.modelType}`, function (req, res, next) {
            _this.handlePostRequest(req, res, next);
        });
        this.app.patch(`/api/${this.modelType}/:id`, function (req, res, next) {
            _this.handlePatchRequest(req, res, next);
        });
        this.app.delete(`/api/${this.modelType}/:id`, function (req, res, next) {
            _this.handleDeleteRequest(req, res, next);
        });
        this.app.all(`/api/${this.modelType}/:id/relationships`, function (req, res, next) {
            not_found_handler_1.default(req, res, next);
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
     * @param {Function} next The next Express handler/middleware
     */
    handleGetListRequest(req, res, next) {
        let controller = new this.controllerClass(this.model);
        let request = new GetListRequest(req, this.model);
        request.validate().then(sequelizeQueryParams => {
            controller.getList(sequelizeQueryParams).then((result) => {
                let parsedUrl = parseurl(req);
                let queryParams = parsedUrl.search || '';
                let count = result.count;
                let foundModels = result.rows;
                let json = {
                    links: {
                        self: `${config_1.default.getApiBaseUrl()}/${this.modelType}${queryParams}`
                    },
                    data: foundModels.map(model => new JsonApiResourceObject(model)),
                    meta: {
                        total: count
                    }
                };
                Object.assign(json.links, serializePaginationLinks(count, sequelizeQueryParams, parsedUrl));
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
     * Handle a related request
     *
     * @param {String} relationship The related model
     * @param {String} relatedPathSegment The URL path segment for the relationship
     * @param {Express.Request} req The Express request
     * @param {Express.Response} res The Express response
     * @param {Function} next The next Express handler/middleware
     */
    handleRelatedRequest(relationship, relatedPathSegment, req, res, next) {
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
                            self: `${config_1.default.getApiBaseUrl()}/${this.modelType}/${foundModel.id}/${relatedPathSegment}`,
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
     * Handle a relationship objects request
     *
     * @param {String} relationship The related model
     * @param {String} relatedPathSegment The URL path segment for the relationship
     * @param {Express.Request} req The Express request
     * @param {Express.Response} res The Express response
     * @param {Function} next The next Express handler/middleware
     */
    handleRelationshipObjectsRequest(relationship, relatedPathSegment, req, res, next) {
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
                // Resource Identifier Objects only require ID and type attributes
                sequelizeQueryParams.attributes = ['id'];
                foundModel[accessorMethodName](sequelizeQueryParams).then(foundModels => {
                    let json = {
                        links: {
                            self: `${config_1.default.getApiBaseUrl()}/${this.modelType}/${foundModel.id}/relationships/${relatedPathSegment}`,
                            related: `${config_1.default.getApiBaseUrl()}/${this.modelType}/${foundModel.id}/${relatedPathSegment}`,
                        },
                        data: (association.isMultiAssociation) ?
                            foundModels.map(model => new JsonApiResourceIdentifierObject(model)) :
                            new JsonApiResourceIdentifierObject(foundModels)
                    };
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
            tryHandlingCrudError(err, this.model).then(errorResponseData => {
                res
                    .status(errorResponseData.status)
                    .json(errorResponseData.json);
            }).catch(err => {
                next(err, req, res, next);
            });
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
            tryHandlingCrudError(err, this.model).then(errorResponseData => {
                res
                    .status(errorResponseData.status)
                    .json(errorResponseData.json);
            }).catch(err => {
                next(err, req, res, next);
            });
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
 * Build a related get list route for a given route's model's relationship
 *
 * @param {Route} route Route instance to define the route handlers for
 * @param {String} relationship Name of the relationship to define route handlers for
 */
function buildRelatedGetListRoutesForRelationship(route, relationship) {
    let association = route.model.associations[relationship];
    let relatedModel = association.target;
    let relatedModelType = StringUtils.convertCamelToDasherized(relatedModel.name);
    let relatedPathSegment = (association.isMultiAssociation) ?
        inflection.pluralize(relatedModelType) :
        relatedModelType;
    // Define a handler for getting relationship objects for the relationship
    route.app.get(`/api/${route.modelType}/:id/relationships/${relatedPathSegment}`, function () {
        route.handleRelationshipObjectsRequest(relationship, relatedPathSegment, ...arguments);
    });
    // Define a general 404 handler for non-existent relationships
    route.app.all(`/api/${route.modelType}/:id/relationships/:relationship`, (req, res) => {
        let msg = `The relationship "${req.params.relationship}" does not exist for ${route.modelType}`;
        res.status(404).json({
            errors: [
                new NotFoundError(msg)
            ]
        });
    });
    // Define a handler for getting the related objects themselves
    route.app.get(`/api/${route.modelType}/:id/${relatedPathSegment}`, function () {
        route.handleRelatedRequest(relationship, relatedPathSegment, ...arguments);
    });
    // Define a general 404 handler for non-existent relationships
    route.app.all(`/api/${route.modelType}/:id/:relationship`, (req, res) => {
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
function convertAttrsToCamelCase(attrs) {
    let camelCaseAttrs = {};
    Object.keys(attrs).forEach(keyName => {
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
    let base = config_1.default.getBaseUrl() + parsedUrl.pathname;
    let query = (parsedUrl.search || '')
        .slice(1)
        .replace(REGEX_TO_REMOVE_PAGE_PARAMS, '');
    let offset = sequelizeQueryParams.offset;
    let limit = sequelizeQueryParams.limit;
    let lastOffset = Math.floor(count / limit) * limit;
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
        last: last,
        next: next,
        prev: prev,
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUssQ0FBQyxDQUFDO1FBQy9CLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztBQUMxQixDQUFDO0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMiLCJmaWxlIjoicm91dGUvcm91dGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGluZmxlY3Rpb24gPSByZXF1aXJlKCdpbmZsZWN0aW9uJyk7XG5jb25zdCBTdHJpbmdVdGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzL1N0cmluZycpO1xuY29uc3QgSnNvbkFwaVJlc291cmNlT2JqZWN0ID0gcmVxdWlyZSgnLi8uLi9qc29uYXBpL1Jlc291cmNlT2JqZWN0Jyk7XG5jb25zdCBKc29uQXBpUmVzb3VyY2VJZGVudGlmaWVyT2JqZWN0ID0gcmVxdWlyZSgnLi8uLi9qc29uYXBpL1Jlc291cmNlSWRlbnRpZmllck9iamVjdCcpO1xuY29uc3QgSnNvbkFwaVJlc291cmNlT2JqZWN0TGlua3MgPSByZXF1aXJlKCcuLy4uL2pzb25hcGkvUmVzb3VyY2VPYmplY3RMaW5rcycpO1xuY29uc3QgTm90Rm91bmRFcnJvciA9IHJlcXVpcmUoJy4vLi4vanNvbmFwaS9lcnJvcnMvTm90Rm91bmRFcnJvcicpO1xuaW1wb3J0IE5vdEZvdW5kSGFuZGxlciBmcm9tICcuLy4uL2pzb25hcGkvbWlkZGxld2FyZS9ub3QtZm91bmQtaGFuZGxlcic7XG5jb25zdCBHZXRMaXN0UmVxdWVzdCA9IHJlcXVpcmUoJy4vLi4vanNvbmFwaS9HZXRMaXN0UmVxdWVzdCcpO1xuY29uc3QgSnNvbkFwaUV4dHJhY3RJbmNsdWRlZE1vZGVsc0FzRmxhdEFycmF5ID0gcmVxdWlyZSgnLi8uLi9qc29uYXBpL2V4dHJhY3QtaW5jbHVkZWQtbW9kZWxzLWFzLWZsYXQtYXJyYXknKTtcbmNvbnN0IHBhcnNldXJsID0gcmVxdWlyZSgncGFyc2V1cmwnKTtcbmltcG9ydCBjb25maWcgZnJvbSAnLi8uLi9jb25maWcvY29uZmlnJztcbmltcG9ydCB7IE1vZGVsIH0gZnJvbSAnc2VxdWVsaXplJztcbmltcG9ydCB7IFxuICBBcHBsaWNhdGlvbixcbiAgTmV4dEZ1bmN0aW9uLFxuICBSZXF1ZXN0LFxuICBSZXNwb25zZSBcbn0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgQ29udHJvbGxlciwgeyBDb250cm9sbGVyQ29uc3RydWN0b3IgfSBmcm9tICcuLy4uL2NvbnRyb2xsZXJzL2NvbnRyb2xsZXInO1xuY29uc3QgdHJ5SGFuZGxpbmdDcnVkRXJyb3IgPSByZXF1aXJlKCcuLy4uL2pzb25hcGkvZXJyb3JzL3RyeUhhbmRsaW5nQ3J1ZEVycm9yJyk7XG5cbmNvbnN0IFJFR0VYX1RPX1JFTU9WRV9QQUdFX1BBUkFNUyA9IC9bXFw/Jl0/cGFnZVxcW1tcXHddK1xcXT1bXFxkXSovZztcblxuY2xhc3MgUm91dGUge1xuXG4gIC8qKiBcbiAgICogRXhwcmVzcyBhcHBsaWNhdGlvbiBpbnN0YW5jZVxuICAgKiBcbiAgICogQHZhciB7RXhwcmVzcy5BcHBsaWNhdGlvbn1cbiAgICovXG4gIGFwcDogQXBwbGljYXRpb247XG5cbiAgY29udHJvbGxlckNsYXNzOiBDb250cm9sbGVyQ29uc3RydWN0b3I7XG5cbiAgLyoqXG4gICAqIFNlcXVlbGl6ZSBtb2RlbCBjbGFzcyB0byBidWlsZCByb3V0ZXMgZm9yXG4gICAqIFxuICAgKiBAdmFyIHtTZXF1ZWxpemUuTW9kZWx9XG4gICAqL1xuICBtb2RlbDogTW9kZWw8YW55LCBhbnk+O1xuXG4gIC8qKlxuICAgKiBKU09OIEFQSSBtb2RlbCB0eXBlIG5hbWVcbiAgICogXG4gICAqIEB2YXIge1N0cmluZ31cbiAgICovXG4gIG1vZGVsVHlwZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBKU09OIEFQSS1jb21wbGlhbnQgcm91dGVcbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSB7RXhwcmVzcy5BcHBsaWNhdGlvbn0gYXBwIFRoZSBFeHByZXNzIGFwcGxpY2F0aW9uIGluc3RhbmNlXG4gICAqIEBwYXJhbSB7U2VxdWVsaXplLk1vZGVsfSBtb2RlbCBUaGUgU2VxdWVsaXplIG1vZGVsIGNsYXNzIHRvIGJ1aWxkIHJvdXRlcyBmb3JcbiAgICogQHBhcmFtIHtDb250cm9sbGVyfSBjb250cm9sbGVyQ2xhc3MgVGhlIGNvbnRyb2xsZXIgY2xhc3MgdG8gbWFwIHJlcXVlc3RzIHRvXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhcHAsIG1vZGVsLCBjb250cm9sbGVyQ2xhc3MpIHtcbiAgICB0aGlzLmFwcCA9IGFwcDtcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7XG4gICAgdGhpcy5jb250cm9sbGVyQ2xhc3MgPSBjb250cm9sbGVyQ2xhc3M7XG4gICAgdGhpcy5tb2RlbFR5cGUgPSBtb2RlbC5nZXRUeXBlKCk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlsaXplIHRoZSByb3V0ZXMgb24gdGhlIGFwcFxuICAgKi9cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBsZXQgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5hcHAuZ2V0KGAvYXBpLyR7dGhpcy5tb2RlbFR5cGV9YCwgZnVuY3Rpb24ocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pIHtcbiAgICAgIF90aGlzLmhhbmRsZUdldExpc3RSZXF1ZXN0KHJlcSwgcmVzLCBuZXh0KTtcbiAgICB9KTtcblxuICAgIHRoaXMuYXBwLmdldChgL2FwaS8ke3RoaXMubW9kZWxUeXBlfS86aWRgLCBmdW5jdGlvbihyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbikge1xuICAgICAgX3RoaXMuaGFuZGxlR2V0UmVxdWVzdChyZXEsIHJlcywgbmV4dCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmFwcC5wb3N0KGAvYXBpLyR7dGhpcy5tb2RlbFR5cGV9YCwgZnVuY3Rpb24ocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pIHtcbiAgICAgIF90aGlzLmhhbmRsZVBvc3RSZXF1ZXN0KHJlcSwgcmVzLCBuZXh0KTtcbiAgICB9KTtcblxuICAgIHRoaXMuYXBwLnBhdGNoKGAvYXBpLyR7dGhpcy5tb2RlbFR5cGV9LzppZGAsIGZ1bmN0aW9uKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSB7XG4gICAgICBfdGhpcy5oYW5kbGVQYXRjaFJlcXVlc3QocmVxLCByZXMsIG5leHQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5hcHAuZGVsZXRlKGAvYXBpLyR7dGhpcy5tb2RlbFR5cGV9LzppZGAsIGZ1bmN0aW9uKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSB7XG4gICAgICBfdGhpcy5oYW5kbGVEZWxldGVSZXF1ZXN0KHJlcSwgcmVzLCBuZXh0KTtcbiAgICB9KTtcblxuICAgIHRoaXMuYXBwLmFsbChgL2FwaS8ke3RoaXMubW9kZWxUeXBlfS86aWQvcmVsYXRpb25zaGlwc2AsIGZ1bmN0aW9uKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSB7XG4gICAgICBOb3RGb3VuZEhhbmRsZXIocmVxLCByZXMsIG5leHQpO1xuICAgIH0pO1xuXG4gICAgT2JqZWN0LmtleXModGhpcy5tb2RlbC5hc3NvY2lhdGlvbnMpLmZvckVhY2gocmVsYXRpb25zaGlwID0+IHtcbiAgICAgIGJ1aWxkUmVsYXRlZEdldExpc3RSb3V0ZXNGb3JSZWxhdGlvbnNoaXAodGhpcywgcmVsYXRpb25zaGlwKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgYSBnZXQgbGlzdCByZXF1ZXN0XG4gICAqXG4gICAqIEBwYXJhbSB7RXhwcmVzcy5SZXF1ZXN0fSByZXEgVGhlIEV4cHJlc3MgcmVxdWVzdFxuICAgKiBAcGFyYW0ge0V4cHJlc3MuUmVzcG9uc2V9IHJlcyBUaGUgRXhwcmVzcyByZXNwb25zZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0IFRoZSBuZXh0IEV4cHJlc3MgaGFuZGxlci9taWRkbGV3YXJlXG4gICAqL1xuICBoYW5kbGVHZXRMaXN0UmVxdWVzdChyZXEsIHJlcywgbmV4dCkge1xuICAgIGxldCBjb250cm9sbGVyID0gbmV3IHRoaXMuY29udHJvbGxlckNsYXNzKHRoaXMubW9kZWwpO1xuICAgIGxldCByZXF1ZXN0ICAgID0gbmV3IEdldExpc3RSZXF1ZXN0KHJlcSwgdGhpcy5tb2RlbCk7XG5cbiAgICByZXF1ZXN0LnZhbGlkYXRlKCkudGhlbihzZXF1ZWxpemVRdWVyeVBhcmFtcyA9PiB7XG4gICAgICBjb250cm9sbGVyLmdldExpc3Qoc2VxdWVsaXplUXVlcnlQYXJhbXMpLnRoZW4oKHJlc3VsdDogYW55KSA9PiB7XG4gICAgICAgIGxldCBwYXJzZWRVcmwgICAgICA9IHBhcnNldXJsKHJlcSk7XG4gICAgICAgIGxldCBxdWVyeVBhcmFtcyAgICA9IHBhcnNlZFVybC5zZWFyY2ggfHwgJyc7XG4gICAgICAgIGxldCBjb3VudCAgICAgICAgICA9IHJlc3VsdC5jb3VudDtcbiAgICAgICAgbGV0IGZvdW5kTW9kZWxzICAgID0gcmVzdWx0LnJvd3M7XG4gICAgICAgIGxldCBqc29uID0ge1xuICAgICAgICAgIGxpbmtzOiB7XG4gICAgICAgICAgICBzZWxmOiBgJHtjb25maWcuZ2V0QXBpQmFzZVVybCgpfS8ke3RoaXMubW9kZWxUeXBlfSR7cXVlcnlQYXJhbXN9YFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZGF0YTogZm91bmRNb2RlbHMubWFwKG1vZGVsID0+IG5ldyBKc29uQXBpUmVzb3VyY2VPYmplY3QobW9kZWwpKSxcbiAgICAgICAgICBtZXRhOiB7XG4gICAgICAgICAgICB0b3RhbDogY291bnRcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICBqc29uLmxpbmtzLFxuICAgICAgICAgIHNlcmlhbGl6ZVBhZ2luYXRpb25MaW5rcyhjb3VudCwgc2VxdWVsaXplUXVlcnlQYXJhbXMsIHBhcnNlZFVybClcbiAgICAgICAgKTtcblxuICAgICAgICBzZXJpYWxpemVJbmNsdWRlc0Zvckpzb24oZm91bmRNb2RlbHMsIGpzb24pO1xuXG4gICAgICAgIHJlcy5qc29uKGpzb24pO1xuICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgbmV4dChlcnIsIHJlcSwgcmVzLCBuZXh0KTtcbiAgICAgIH0pO1xuICAgIH0pLmNhdGNoKGVycm9ycyA9PiB7XG4gICAgICByZXMuc3RhdHVzKDQwMCkuanNvbih7XG4gICAgICAgIGVycm9yczogZXJyb3JzXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgYSByZWxhdGVkIHJlcXVlc3RcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHJlbGF0aW9uc2hpcCBUaGUgcmVsYXRlZCBtb2RlbFxuICAgKiBAcGFyYW0ge1N0cmluZ30gcmVsYXRlZFBhdGhTZWdtZW50IFRoZSBVUkwgcGF0aCBzZWdtZW50IGZvciB0aGUgcmVsYXRpb25zaGlwXG4gICAqIEBwYXJhbSB7RXhwcmVzcy5SZXF1ZXN0fSByZXEgVGhlIEV4cHJlc3MgcmVxdWVzdFxuICAgKiBAcGFyYW0ge0V4cHJlc3MuUmVzcG9uc2V9IHJlcyBUaGUgRXhwcmVzcyByZXNwb25zZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0IFRoZSBuZXh0IEV4cHJlc3MgaGFuZGxlci9taWRkbGV3YXJlXG4gICAqL1xuICBoYW5kbGVSZWxhdGVkUmVxdWVzdChyZWxhdGlvbnNoaXAsIHJlbGF0ZWRQYXRoU2VnbWVudCwgcmVxLCByZXMsIG5leHQpIHtcbiAgICBsZXQgYXNzb2NpYXRpb24gPSB0aGlzLm1vZGVsLmFzc29jaWF0aW9uc1tyZWxhdGlvbnNoaXBdO1xuICAgIGxldCByZWxhdGVkTW9kZWwgPSBhc3NvY2lhdGlvbi50YXJnZXQ7XG4gICAgbGV0IGNvbnRyb2xsZXIgPSBuZXcgdGhpcy5jb250cm9sbGVyQ2xhc3ModGhpcy5tb2RlbCk7XG4gICAgbGV0IHJlcXVlc3QgPSBuZXcgR2V0TGlzdFJlcXVlc3QocmVxLCByZWxhdGVkTW9kZWwpO1xuICAgIGxldCBhY2Nlc3Nvck1ldGhvZE5hbWUgPSBhc3NvY2lhdGlvbi5hY2Nlc3NvcnMuZ2V0O1xuXG4gICAgY29udHJvbGxlci5nZXRPbmUocmVxLnBhcmFtcy5pZCkudGhlbihmb3VuZE1vZGVsID0+IHtcbiAgICAgIGlmICghZm91bmRNb2RlbCkge1xuICAgICAgICByZXR1cm4gdGhyb3dOb01vZGVsVHlwZUZvdW5kV2l0aElkKHJlcSwgcmVzLCB0aGlzLm1vZGVsVHlwZSk7XG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QudmFsaWRhdGUoKS50aGVuKHNlcXVlbGl6ZVF1ZXJ5UGFyYW1zID0+IHtcbiAgICAgICAgZm91bmRNb2RlbFthY2Nlc3Nvck1ldGhvZE5hbWVdKHNlcXVlbGl6ZVF1ZXJ5UGFyYW1zKS50aGVuKGZvdW5kTW9kZWxzID0+IHtcbiAgICAgICAgICBsZXQganNvbiA9IHtcbiAgICAgICAgICAgIGxpbmtzOiB7XG4gICAgICAgICAgICAgIHNlbGY6IGAke2NvbmZpZy5nZXRBcGlCYXNlVXJsKCl9LyR7dGhpcy5tb2RlbFR5cGV9LyR7Zm91bmRNb2RlbC5pZH0vJHtyZWxhdGVkUGF0aFNlZ21lbnR9YCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkYXRhOiAoYXNzb2NpYXRpb24uaXNNdWx0aUFzc29jaWF0aW9uKSA/XG4gICAgICAgICAgICAgIGZvdW5kTW9kZWxzLm1hcChtb2RlbCA9PiBuZXcgSnNvbkFwaVJlc291cmNlT2JqZWN0KG1vZGVsKSkgOlxuICAgICAgICAgICAgICBuZXcgSnNvbkFwaVJlc291cmNlT2JqZWN0KGZvdW5kTW9kZWxzKVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBzZXJpYWxpemVJbmNsdWRlc0Zvckpzb24oZm91bmRNb2RlbHMsIGpzb24pO1xuXG4gICAgICAgICAgcmVzLmpzb24oanNvbik7XG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgbmV4dChlcnIsIHJlcSwgcmVzLCBuZXh0KTtcbiAgICAgICAgfSk7XG4gICAgICB9KS5jYXRjaChlcnJvcnMgPT4ge1xuICAgICAgICByZXMuc3RhdHVzKDQwMCkuanNvbih7XG4gICAgICAgICAgZXJyb3JzOiBlcnJvcnNcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgYSByZWxhdGlvbnNoaXAgb2JqZWN0cyByZXF1ZXN0XG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSByZWxhdGlvbnNoaXAgVGhlIHJlbGF0ZWQgbW9kZWxcbiAgICogQHBhcmFtIHtTdHJpbmd9IHJlbGF0ZWRQYXRoU2VnbWVudCBUaGUgVVJMIHBhdGggc2VnbWVudCBmb3IgdGhlIHJlbGF0aW9uc2hpcFxuICAgKiBAcGFyYW0ge0V4cHJlc3MuUmVxdWVzdH0gcmVxIFRoZSBFeHByZXNzIHJlcXVlc3RcbiAgICogQHBhcmFtIHtFeHByZXNzLlJlc3BvbnNlfSByZXMgVGhlIEV4cHJlc3MgcmVzcG9uc2VcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbmV4dCBUaGUgbmV4dCBFeHByZXNzIGhhbmRsZXIvbWlkZGxld2FyZVxuICAgKi9cbiAgaGFuZGxlUmVsYXRpb25zaGlwT2JqZWN0c1JlcXVlc3QocmVsYXRpb25zaGlwLCByZWxhdGVkUGF0aFNlZ21lbnQsIHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgbGV0IGFzc29jaWF0aW9uID0gdGhpcy5tb2RlbC5hc3NvY2lhdGlvbnNbcmVsYXRpb25zaGlwXTtcbiAgICBsZXQgcmVsYXRlZE1vZGVsID0gYXNzb2NpYXRpb24udGFyZ2V0O1xuICAgIGxldCBjb250cm9sbGVyID0gbmV3IHRoaXMuY29udHJvbGxlckNsYXNzKHRoaXMubW9kZWwpO1xuICAgIGxldCByZXF1ZXN0ID0gbmV3IEdldExpc3RSZXF1ZXN0KHJlcSwgcmVsYXRlZE1vZGVsKTtcbiAgICBsZXQgYWNjZXNzb3JNZXRob2ROYW1lID0gYXNzb2NpYXRpb24uYWNjZXNzb3JzLmdldDtcblxuICAgIGNvbnRyb2xsZXIuZ2V0T25lKHJlcS5wYXJhbXMuaWQpLnRoZW4oZm91bmRNb2RlbCA9PiB7XG4gICAgICBpZiAoIWZvdW5kTW9kZWwpIHtcbiAgICAgICAgcmV0dXJuIHRocm93Tm9Nb2RlbFR5cGVGb3VuZFdpdGhJZChyZXEsIHJlcywgdGhpcy5tb2RlbFR5cGUpO1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LnZhbGlkYXRlKCkudGhlbihzZXF1ZWxpemVRdWVyeVBhcmFtcyA9PiB7XG5cbiAgICAgICAgLy8gUmVzb3VyY2UgSWRlbnRpZmllciBPYmplY3RzIG9ubHkgcmVxdWlyZSBJRCBhbmQgdHlwZSBhdHRyaWJ1dGVzXG4gICAgICAgIHNlcXVlbGl6ZVF1ZXJ5UGFyYW1zLmF0dHJpYnV0ZXMgPSBbJ2lkJ107XG5cbiAgICAgICAgZm91bmRNb2RlbFthY2Nlc3Nvck1ldGhvZE5hbWVdKHNlcXVlbGl6ZVF1ZXJ5UGFyYW1zKS50aGVuKGZvdW5kTW9kZWxzID0+IHtcbiAgICAgICAgICBsZXQganNvbiA9IHtcbiAgICAgICAgICAgIGxpbmtzOiB7XG4gICAgICAgICAgICAgIHNlbGY6IGAke2NvbmZpZy5nZXRBcGlCYXNlVXJsKCl9LyR7dGhpcy5tb2RlbFR5cGV9LyR7Zm91bmRNb2RlbC5pZH0vcmVsYXRpb25zaGlwcy8ke3JlbGF0ZWRQYXRoU2VnbWVudH1gLFxuICAgICAgICAgICAgICByZWxhdGVkOiBgJHtjb25maWcuZ2V0QXBpQmFzZVVybCgpfS8ke3RoaXMubW9kZWxUeXBlfS8ke2ZvdW5kTW9kZWwuaWR9LyR7cmVsYXRlZFBhdGhTZWdtZW50fWAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YTogKGFzc29jaWF0aW9uLmlzTXVsdGlBc3NvY2lhdGlvbikgP1xuICAgICAgICAgICAgICBmb3VuZE1vZGVscy5tYXAobW9kZWwgPT4gbmV3IEpzb25BcGlSZXNvdXJjZUlkZW50aWZpZXJPYmplY3QobW9kZWwpKSA6XG4gICAgICAgICAgICAgIG5ldyBKc29uQXBpUmVzb3VyY2VJZGVudGlmaWVyT2JqZWN0KGZvdW5kTW9kZWxzKVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICByZXMuanNvbihqc29uKTtcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICBuZXh0KGVyciwgcmVxLCByZXMsIG5leHQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pLmNhdGNoKGVycm9ycyA9PiB7XG4gICAgICAgIHJlcy5zdGF0dXMoNDAwKS5qc29uKHtcbiAgICAgICAgICBlcnJvcnM6IGVycm9yc1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBhIGdldCByZXF1ZXN0XG4gICAqXG4gICAqIEBwYXJhbSB7RXhwcmVzcy5SZXF1ZXN0fSByZXEgVGhlIEV4cHJlc3MgcmVxdWVzdFxuICAgKiBAcGFyYW0ge0V4cHJlc3MuUmVzcG9uc2V9IHJlcyBUaGUgRXhwcmVzcyByZXNwb25zZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0IFRoZSBuZXh0IEV4cHJlc3MgaGFuZGxlci9taWRkbGV3YXJlXG4gICAqL1xuICBoYW5kbGVHZXRSZXF1ZXN0KHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgbGV0IGNvbnRyb2xsZXIgPSBuZXcgdGhpcy5jb250cm9sbGVyQ2xhc3ModGhpcy5tb2RlbCk7XG5cbiAgICBjb250cm9sbGVyLmdldE9uZShyZXEucGFyYW1zLmlkKS50aGVuKGZvdW5kTW9kZWwgPT4ge1xuICAgICAgaWYgKCFmb3VuZE1vZGVsKSB7XG4gICAgICAgIHJldHVybiB0aHJvd05vTW9kZWxUeXBlRm91bmRXaXRoSWQocmVxLCByZXMsIHRoaXMubW9kZWxUeXBlKTtcbiAgICAgIH1cblxuICAgICAgcmVzLmpzb24oe1xuICAgICAgICBsaW5rczogbmV3IEpzb25BcGlSZXNvdXJjZU9iamVjdExpbmtzKGZvdW5kTW9kZWwpLFxuICAgICAgICBkYXRhOiBuZXcgSnNvbkFwaVJlc291cmNlT2JqZWN0KGZvdW5kTW9kZWwpXG4gICAgICB9KTtcbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgbmV4dChlcnIsIHJlcSwgcmVzLCBuZXh0KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgYSBwb3N0IHJlcXVlc3RcbiAgICpcbiAgICogQHBhcmFtIHtFeHByZXNzLlJlcXVlc3R9IHJlcSBUaGUgRXhwcmVzcyByZXF1ZXN0XG4gICAqIEBwYXJhbSB7RXhwcmVzcy5SZXNwb25zZX0gcmVzIFRoZSBFeHByZXNzIHJlc3BvbnNlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHQgVGhlIG5leHQgRXhwcmVzcyBoYW5kbGVyL21pZGRsZXdhcmVcbiAgICovXG4gIGhhbmRsZVBvc3RSZXF1ZXN0KHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgbGV0IGNvbnRyb2xsZXIgPSBuZXcgdGhpcy5jb250cm9sbGVyQ2xhc3ModGhpcy5tb2RlbCk7XG4gICAgY29uc3QgYXR0cnMgPSBjb252ZXJ0QXR0cnNUb0NhbWVsQ2FzZShyZXEuYm9keS5kYXRhLmF0dHJpYnV0ZXMpO1xuXG4gICAgY29udHJvbGxlci5jcmVhdGVPbmUoYXR0cnMpLnRoZW4obmV3TW9kZWwgPT4ge1xuICAgICAgbGV0IGxpbmtzID0gbmV3IEpzb25BcGlSZXNvdXJjZU9iamVjdExpbmtzKG5ld01vZGVsKTtcblxuICAgICAgcmVzXG4gICAgICAgIC5sb2NhdGlvbihsaW5rcy5saW5rcy5zZWxmKVxuICAgICAgICAuc3RhdHVzKDIwMSlcbiAgICAgICAgLmpzb24oe1xuICAgICAgICAgIGxpbmtzOiBsaW5rcyxcbiAgICAgICAgICBkYXRhOiBuZXcgSnNvbkFwaVJlc291cmNlT2JqZWN0KG5ld01vZGVsKVxuICAgICAgICB9KTtcbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgdHJ5SGFuZGxpbmdDcnVkRXJyb3IoZXJyLCB0aGlzLm1vZGVsKS50aGVuKGVycm9yUmVzcG9uc2VEYXRhID0+IHtcbiAgICAgICAgcmVzXG4gICAgICAgICAgLnN0YXR1cyhlcnJvclJlc3BvbnNlRGF0YS5zdGF0dXMpXG4gICAgICAgICAgLmpzb24oZXJyb3JSZXNwb25zZURhdGEuanNvbik7XG4gICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICBuZXh0KGVyciwgcmVxLCByZXMsIG5leHQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIGEgcGF0Y2ggcmVxdWVzdFxuICAgKlxuICAgKiBAcGFyYW0ge0V4cHJlc3MuUmVxdWVzdH0gcmVxIFRoZSBFeHByZXNzIHJlcXVlc3RcbiAgICogQHBhcmFtIHtFeHByZXNzLlJlc3BvbnNlfSByZXMgVGhlIEV4cHJlc3MgcmVzcG9uc2VcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbmV4dCBUaGUgbmV4dCBFeHByZXNzIGhhbmRsZXIvbWlkZGxld2FyZVxuICAgKi9cbiAgaGFuZGxlUGF0Y2hSZXF1ZXN0KHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgbGV0IGNvbnRyb2xsZXIgPSBuZXcgdGhpcy5jb250cm9sbGVyQ2xhc3ModGhpcy5tb2RlbCk7XG4gICAgY29uc3QgYXR0cnMgPSBjb252ZXJ0QXR0cnNUb0NhbWVsQ2FzZShyZXEuYm9keS5kYXRhLmF0dHJpYnV0ZXMpO1xuXG4gICAgY29udHJvbGxlci51cGRhdGVPbmUocmVxLnBhcmFtcy5pZCwgYXR0cnMpLnRoZW4odXBkYXRlZE1vZGVsID0+IHtcbiAgICAgIGlmICghdXBkYXRlZE1vZGVsKSB7XG4gICAgICAgIHJldHVybiB0aHJvd05vTW9kZWxUeXBlRm91bmRXaXRoSWQocmVxLCByZXMsIHRoaXMubW9kZWxUeXBlKTtcbiAgICAgIH1cblxuICAgICAgcmVzLmpzb24oe1xuICAgICAgICBsaW5rczogbmV3IEpzb25BcGlSZXNvdXJjZU9iamVjdExpbmtzKHVwZGF0ZWRNb2RlbCksXG4gICAgICAgIGRhdGE6IG5ldyBKc29uQXBpUmVzb3VyY2VPYmplY3QodXBkYXRlZE1vZGVsKVxuICAgICAgfSk7XG4gICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgIHRyeUhhbmRsaW5nQ3J1ZEVycm9yKGVyciwgdGhpcy5tb2RlbCkudGhlbihlcnJvclJlc3BvbnNlRGF0YSA9PiB7XG4gICAgICAgIHJlc1xuICAgICAgICAgIC5zdGF0dXMoZXJyb3JSZXNwb25zZURhdGEuc3RhdHVzKVxuICAgICAgICAgIC5qc29uKGVycm9yUmVzcG9uc2VEYXRhLmpzb24pO1xuICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgbmV4dChlcnIsIHJlcSwgcmVzLCBuZXh0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBhIGRlbGV0ZSByZXF1ZXN0XG4gICAqXG4gICAqIEBwYXJhbSB7RXhwcmVzcy5SZXF1ZXN0fSByZXEgVGhlIEV4cHJlc3MgcmVxdWVzdFxuICAgKiBAcGFyYW0ge0V4cHJlc3MuUmVzcG9uc2V9IHJlcyBUaGUgRXhwcmVzcyByZXNwb25zZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0IFRoZSBuZXh0IEV4cHJlc3MgaGFuZGxlci9taWRkbGV3YXJlXG4gICAqL1xuICBoYW5kbGVEZWxldGVSZXF1ZXN0KHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgbGV0IGNvbnRyb2xsZXIgPSBuZXcgdGhpcy5jb250cm9sbGVyQ2xhc3ModGhpcy5tb2RlbCk7XG5cbiAgICBjb250cm9sbGVyLmRlbGV0ZU9uZShyZXEucGFyYW1zLmlkKS50aGVuKGRlbGV0ZWRNb2RlbCA9PiB7XG4gICAgICBpZiAoIWRlbGV0ZWRNb2RlbCkge1xuICAgICAgICByZXR1cm4gdGhyb3dOb01vZGVsVHlwZUZvdW5kV2l0aElkKHJlcSwgcmVzLCB0aGlzLm1vZGVsVHlwZSk7XG4gICAgICB9XG5cbiAgICAgIHJlcy5zdGF0dXMoMjA0KS5lbmQoKTtcbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgbmV4dChlcnIsIHJlcSwgcmVzLCBuZXh0KTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEJ1aWxkIGEgcmVsYXRlZCBnZXQgbGlzdCByb3V0ZSBmb3IgYSBnaXZlbiByb3V0ZSdzIG1vZGVsJ3MgcmVsYXRpb25zaGlwXG4gKlxuICogQHBhcmFtIHtSb3V0ZX0gcm91dGUgUm91dGUgaW5zdGFuY2UgdG8gZGVmaW5lIHRoZSByb3V0ZSBoYW5kbGVycyBmb3JcbiAqIEBwYXJhbSB7U3RyaW5nfSByZWxhdGlvbnNoaXAgTmFtZSBvZiB0aGUgcmVsYXRpb25zaGlwIHRvIGRlZmluZSByb3V0ZSBoYW5kbGVycyBmb3JcbiAqL1xuZnVuY3Rpb24gYnVpbGRSZWxhdGVkR2V0TGlzdFJvdXRlc0ZvclJlbGF0aW9uc2hpcChyb3V0ZSwgcmVsYXRpb25zaGlwKSB7XG4gIGxldCBhc3NvY2lhdGlvbiA9IHJvdXRlLm1vZGVsLmFzc29jaWF0aW9uc1tyZWxhdGlvbnNoaXBdO1xuICBsZXQgcmVsYXRlZE1vZGVsID0gYXNzb2NpYXRpb24udGFyZ2V0O1xuICBsZXQgcmVsYXRlZE1vZGVsVHlwZSA9IFN0cmluZ1V0aWxzLmNvbnZlcnRDYW1lbFRvRGFzaGVyaXplZChyZWxhdGVkTW9kZWwubmFtZSk7XG4gIGxldCByZWxhdGVkUGF0aFNlZ21lbnQgPSAoYXNzb2NpYXRpb24uaXNNdWx0aUFzc29jaWF0aW9uKSA/XG4gICAgaW5mbGVjdGlvbi5wbHVyYWxpemUocmVsYXRlZE1vZGVsVHlwZSkgOlxuICAgIHJlbGF0ZWRNb2RlbFR5cGU7XG5cbiAgLy8gRGVmaW5lIGEgaGFuZGxlciBmb3IgZ2V0dGluZyByZWxhdGlvbnNoaXAgb2JqZWN0cyBmb3IgdGhlIHJlbGF0aW9uc2hpcFxuICByb3V0ZS5hcHAuZ2V0KGAvYXBpLyR7cm91dGUubW9kZWxUeXBlfS86aWQvcmVsYXRpb25zaGlwcy8ke3JlbGF0ZWRQYXRoU2VnbWVudH1gLCBmdW5jdGlvbigpIHtcbiAgICByb3V0ZS5oYW5kbGVSZWxhdGlvbnNoaXBPYmplY3RzUmVxdWVzdChcbiAgICAgIHJlbGF0aW9uc2hpcCxcbiAgICAgIHJlbGF0ZWRQYXRoU2VnbWVudCxcbiAgICAgIC4uLmFyZ3VtZW50c1xuICAgICk7XG4gIH0pO1xuXG4gIC8vIERlZmluZSBhIGdlbmVyYWwgNDA0IGhhbmRsZXIgZm9yIG5vbi1leGlzdGVudCByZWxhdGlvbnNoaXBzXG4gIHJvdXRlLmFwcC5hbGwoYC9hcGkvJHtyb3V0ZS5tb2RlbFR5cGV9LzppZC9yZWxhdGlvbnNoaXBzLzpyZWxhdGlvbnNoaXBgLCAocmVxLCByZXMpID0+IHtcbiAgICBsZXQgbXNnID0gYFRoZSByZWxhdGlvbnNoaXAgXCIke3JlcS5wYXJhbXMucmVsYXRpb25zaGlwfVwiIGRvZXMgbm90IGV4aXN0IGZvciAke3JvdXRlLm1vZGVsVHlwZX1gO1xuXG4gICAgcmVzLnN0YXR1cyg0MDQpLmpzb24oe1xuICAgICAgZXJyb3JzOiBbXG4gICAgICAgIG5ldyBOb3RGb3VuZEVycm9yKG1zZylcbiAgICAgIF1cbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gRGVmaW5lIGEgaGFuZGxlciBmb3IgZ2V0dGluZyB0aGUgcmVsYXRlZCBvYmplY3RzIHRoZW1zZWx2ZXNcbiAgcm91dGUuYXBwLmdldChgL2FwaS8ke3JvdXRlLm1vZGVsVHlwZX0vOmlkLyR7cmVsYXRlZFBhdGhTZWdtZW50fWAsIGZ1bmN0aW9uKCkge1xuICAgIHJvdXRlLmhhbmRsZVJlbGF0ZWRSZXF1ZXN0KFxuICAgICAgcmVsYXRpb25zaGlwLFxuICAgICAgcmVsYXRlZFBhdGhTZWdtZW50LFxuICAgICAgLi4uYXJndW1lbnRzXG4gICAgKTtcbiAgfSk7XG5cbiAgLy8gRGVmaW5lIGEgZ2VuZXJhbCA0MDQgaGFuZGxlciBmb3Igbm9uLWV4aXN0ZW50IHJlbGF0aW9uc2hpcHNcbiAgcm91dGUuYXBwLmFsbChgL2FwaS8ke3JvdXRlLm1vZGVsVHlwZX0vOmlkLzpyZWxhdGlvbnNoaXBgLCAocmVxLCByZXMpID0+IHtcbiAgICBsZXQgbXNnID0gYFRoZSByZWxhdGlvbnNoaXAgXCIke3JlcS5wYXJhbXMucmVsYXRpb25zaGlwfVwiIGRvZXMgbm90IGV4aXN0IGZvciAke3JvdXRlLm1vZGVsVHlwZX1gO1xuXG4gICAgcmVzLnN0YXR1cyg0MDQpLmpzb24oe1xuICAgICAgZXJyb3JzOiBbXG4gICAgICAgIG5ldyBOb3RGb3VuZEVycm9yKG1zZylcbiAgICAgIF1cbiAgICB9KTtcbiAgfSk7XG5cbn1cblxuLyoqXG4gKiBDb252ZXJ0IGtleW5hbWVzIGluIGF0dHJpYnV0ZXMgb2JqZWN0IGZyb20gZGFzaGVyaXplZCB0byBjYW1lbCBjYXNlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGF0dHJzIEF0dHJpYnV0ZXMgb2JqZWN0XG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRBdHRyc1RvQ2FtZWxDYXNlKGF0dHJzKSB7XG4gIGxldCBjYW1lbENhc2VBdHRycyA9IHt9O1xuXG4gIE9iamVjdC5rZXlzKGF0dHJzKS5mb3JFYWNoKGtleU5hbWUgPT4ge1xuICAgIGxldCBjYW1lbENhc2VLZXkgPSBTdHJpbmdVdGlscy5jb252ZXJ0RGFzaGVyaXplZFRvQ2FtZWxDYXNlKGtleU5hbWUpO1xuXG4gICAgY2FtZWxDYXNlQXR0cnNbY2FtZWxDYXNlS2V5XSA9IGF0dHJzW2tleU5hbWVdO1xuICB9KTtcblxuICByZXR1cm4gY2FtZWxDYXNlQXR0cnM7XG59XG5cbi8qKlxuICogU2VyaWFsaXplIGluY2x1ZGVzIGZvciBKU09OIHJlc3BvbnNlLlxuICpcbiAqIEV4dHJhY3RzIGFuZCBmbGF0dGVucyBhbiBhcnJheSBvZiBhbnkgcmVsYXRlZCBtb2RlbHMgdGhhdCBhcmUgbmVzdGVkIGluIHRoZVxuICogbW9kZWxzIHJldHVybmVkIGJ5IGEgU2VxdWVsaXplIHF1ZXJ5LCBlbnN1cmluZyB1bmlxdWVuZXNzIG9mIHJldHVybmVkIG1vZGVsc1xuICogYnkgdHlwZSBhbmQgSUQuXG4gKlxuICogQHBhcmFtIHtTZXF1ZWxpemUuTW9kZWxbXX0gbW9kZWxBcnJheSBBcnJheSBvZiBtb2RlbHMgdG8gc2VyaWFsaXplIGFzIGluY2x1ZGVkXG4gKiBAcGFyYW0ge09iamVjdH0ganNvbiBPYmplY3QgdG8gYmUgc2VyaWFsaXplZCBhcyBKU09OIHJlc3BvbnNlXG4gKi9cbmZ1bmN0aW9uIHNlcmlhbGl6ZUluY2x1ZGVzRm9ySnNvbihtb2RlbEFycmF5LCBqc29uKSB7XG4gIGxldCBpbmNsdWRlZE1vZGVscyA9IFtdO1xuXG4gIEpzb25BcGlFeHRyYWN0SW5jbHVkZWRNb2RlbHNBc0ZsYXRBcnJheShtb2RlbEFycmF5LCBpbmNsdWRlZE1vZGVscyk7XG5cbiAgaWYgKGluY2x1ZGVkTW9kZWxzLmxlbmd0aCkge1xuICAgIGpzb24uaW5jbHVkZWQgPSBnZXRVbmlxdWVNb2RlbEFycmF5KGluY2x1ZGVkTW9kZWxzKVxuICAgICAgLm1hcChtb2RlbCA9PiBuZXcgSnNvbkFwaVJlc291cmNlT2JqZWN0KG1vZGVsKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBCdWlsZCBwYWdpbmF0aW9uIGxpbmtzIGZvciBhIGdldCBsaXN0IHJlcXVlc3QuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IFRoZSB0b3RhbCBjb3VudCBmb3IgYSBnaXZlbiBxdWVyeVxuICogQHBhcmFtIHtPYmplY3R9IHNlcXVlbGl6ZVF1ZXJ5UGFyYW1zIFRoZSBxdWVyeSBjb25zdHJhaW50cyBwYXNzZWQgdG8gU2VxdWVsaXplXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyc2VkVXJsIFRoZSBwYXJzZWQgVVJMXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIHNlcmlhbGl6ZVBhZ2luYXRpb25MaW5rcyhjb3VudCwgc2VxdWVsaXplUXVlcnlQYXJhbXMsIHBhcnNlZFVybCkge1xuICBsZXQgYmFzZSAgICAgICA9IGNvbmZpZy5nZXRCYXNlVXJsKCkgKyBwYXJzZWRVcmwucGF0aG5hbWU7XG4gIGxldCBxdWVyeSAgICAgID0gKHBhcnNlZFVybC5zZWFyY2ggfHwgJycpXG4gICAgLnNsaWNlKDEpXG4gICAgLnJlcGxhY2UoUkVHRVhfVE9fUkVNT1ZFX1BBR0VfUEFSQU1TLCAnJyk7XG4gIGxldCBvZmZzZXQgICAgID0gc2VxdWVsaXplUXVlcnlQYXJhbXMub2Zmc2V0O1xuICBsZXQgbGltaXQgICAgICA9IHNlcXVlbGl6ZVF1ZXJ5UGFyYW1zLmxpbWl0O1xuICBsZXQgbGFzdE9mZnNldCA9IE1hdGguZmxvb3IoY291bnQvbGltaXQpICogbGltaXQ7XG5cbiAgaWYgKHF1ZXJ5KSB7XG4gICAgcXVlcnkgKz0gJyYnO1xuICB9XG5cbiAgbGV0IGJhc2VVcmwgPSBgJHtiYXNlfT8ke3F1ZXJ5fWA7XG5cbiAgbGV0IHByZXYgPSAob2Zmc2V0IC0gbGltaXQgPiAwKSA/XG4gICAgYCR7YmFzZVVybH1wYWdlW29mZnNldF09JHtvZmZzZXQgLSBsaW1pdH0mcGFnZVtsaW1pdF09JHtsaW1pdH1gIDpcbiAgICBudWxsO1xuXG4gIGxldCBuZXh0ID0gb2Zmc2V0ICsgbGltaXQgPD0gbGFzdE9mZnNldCA/XG4gICAgYCR7YmFzZVVybH1wYWdlW29mZnNldF09JHtvZmZzZXQgKyBsaW1pdH0mcGFnZVtsaW1pdF09JHtsaW1pdH1gIDpcbiAgICBudWxsO1xuXG4gIGxldCBmaXJzdCA9IGAke2Jhc2VVcmx9cGFnZVtvZmZzZXRdPTAmcGFnZVtsaW1pdF09JHtsaW1pdH1gO1xuXG4gIGxldCBsYXN0ID0gYCR7YmFzZVVybH1wYWdlW29mZnNldF09JHtsYXN0T2Zmc2V0fSZwYWdlW2xpbWl0XT0ke2xpbWl0fWA7XG5cbiAgcmV0dXJuIHtcbiAgICBmaXJzdDogZmlyc3QsXG4gICAgbGFzdDogIGxhc3QsXG4gICAgbmV4dDogIG5leHQsXG4gICAgcHJldjogIHByZXYsXG4gIH07XG59XG5cbi8qKlxuICogVGhyb3cgYSA0MDQgZXJyb3IgZm9yIG5vIG1vZGVsIGZvdW5kIHdpdGggYW4gSURcbiAqXG4gKiBAcGFyYW0ge0V4cHJlc3MuUmVxdWVzdH0gcmVxIFRoZSBFeHByZXNzIFJlcXVlc3Qgb2JqZWN0XG4gKiBAcGFyYW0ge0V4cHJlc3MuUmVzcG9uc2V9IHJlcyBUaGUgRXhwcmVzcyBSZXNwb25zZSBvYmplY3RcbiAqIEBwYXJhbSB7U3RyaW5nfSBtb2RlbFR5cGUgVGhlIG1vZGVsIHR5cGUgdGhhdCB3YXNuJ3QgZm91bmRcbiAqL1xuZnVuY3Rpb24gdGhyb3dOb01vZGVsVHlwZUZvdW5kV2l0aElkKHJlcSwgcmVzLCBtb2RlbFR5cGUpIHtcbiAgcmVzLnN0YXR1cyg0MDQpLmpzb24oe1xuICAgIGRhdGE6IG51bGwsXG4gICAgZXJyb3JzOiBbXG4gICAgICBuZXcgTm90Rm91bmRFcnJvcihgTm8gJHttb2RlbFR5cGV9IGZvdW5kIHdpdGggdGhlIGlkIG9mICR7cmVxLnBhcmFtcy5pZH1gKVxuICAgIF1cbiAgfSk7XG59XG5cbi8qKlxuICogVGFrZXMgYW4gYXJyYXkgb2YgU2VxdWVsaXplIG1vZGVscyBhbmQgcmV0dXJucyBpdCB3aXRob3V0IGFueSBkdXBsaWNhdGVcbiAqIG1vZGVsc1xuICpcbiAqIEBwYXJhbSB7U2VxdWVsaXplLk1vZGVsW119XG4gKiBAcmV0dXJuIHtTZXF1ZWxpemUuTW9kZWxbXX1cbiAqL1xuZnVuY3Rpb24gZ2V0VW5pcXVlTW9kZWxBcnJheShtb2RlbEFycmF5KSB7XG4gIGxldCBpbmNsdWRlZEtleXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBsZXQgdW5pcXVlTW9kZWxBcnJheSA9IFtdO1xuXG4gIG1vZGVsQXJyYXkuZm9yRWFjaChtb2RlbCA9PiB7XG4gICAgbGV0IGd1aWQgPSBtb2RlbC5uYW1lICsgXCJfXCIgKyBtb2RlbC5pZDtcblxuICAgIGlmICghKGd1aWQgaW4gaW5jbHVkZWRLZXlzKSkge1xuICAgICAgaW5jbHVkZWRLZXlzW2d1aWRdID0gdHJ1ZTtcbiAgICAgIHVuaXF1ZU1vZGVsQXJyYXkucHVzaChtb2RlbCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gdW5pcXVlTW9kZWxBcnJheTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSb3V0ZTtcbiJdfQ==
