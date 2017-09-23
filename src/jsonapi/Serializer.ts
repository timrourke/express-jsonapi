import { Instance, Model } from 'sequelize';
import config from './../config/config';
import extractIncludedModelsAsFlatArray from './../jsonapi/extract-included-models-as-flat-array';
import ResourceIdentifierObject from './../jsonapi/ResourceIdentifierObject';
import JsonApiResourceObject from './../jsonapi/ResourceObject';
import JsonApiResourceObjectLinks from './../jsonapi/ResourceObjectLinks';

/**
 * Regular expression for removing pagination-related query params from a URL
 *
 * @property {RegExp}
 * @final
 */
const REGEX_TO_REMOVE_PAGE_PARAMS = /[\?&]?page\[[\w]+\]=[\d]*/g;

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
function serializePaginationLinks(count: number, offset: number, limit: number, parsedUrl: any) {
  const base = config.getBaseUrl() + parsedUrl.pathname;
  let query  = (parsedUrl.search || '')
    .slice(1)
    .replace(REGEX_TO_REMOVE_PAGE_PARAMS, '');
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
 * The Serializer serializes JSON API compliant response objects from Sequelize
 * query results
 *
 * @class Serializer
 */
export default class Serializer {
  /**
   * The model to serialize responses for
   *
   * @property model
   * @type {Sequelize.Model}
   */
  private model: Model<any, any>;

  /**
   * The model's type
   *
   * @property modelType
   * @type {String}
   */
  private modelType: string;

  /**
   * Constructor.
   *
   * @constructor
   * @param {Sequelize.Model} model The Sequelize model to serialize responses for
   */
  constructor(model: Model<any, any>) {
    this.model = model;

    this.modelType = model.getType();
  }

  /**
   * Build the JSON response for a single model request (GET, POST, PATCH)
   *
   * @method buildGetResponse
   * @param {Sequelize.Instance} model The Sequelize model instance
   * @return {Object}
   */
  public buildSingleModelResponse(model: Instance<any, any>): any {
    return {
      data: new JsonApiResourceObject(model),
      links: new JsonApiResourceObjectLinks(model),
    };
  }

  /**
   * Build the JSON response for a GET list request
   *
   * @method buildGetListResponse
   * @param {String} parsedUrl Object representation of the request URL
   * @param {Number} offset The offset for the query
   * @param {Number} limit The limit for the query
   * @param {Number} total The total number of models in the DB for the query
   * @param {Sequelize.Instance[]} models The Sequelize model instances
   * @return {Object}
   */
  public buildGetListResponse(
    parsedUrl: any,
    offset: number,
    limit: number,
    total: number,
    models: Array<Instance<any, any>>,
  ): any {
    const queryParams: string = parsedUrl.search || '';
    const json = {
      data: models.map((model: Instance<any, any>) => new JsonApiResourceObject(model)),
      links: {
        self: `${config.getApiBaseUrl()}/${this.modelType}${queryParams}`,
      },
      meta: {
        total,
      },
    };

    // Include pagination links in the response payload
    Object.assign(
      json.links,
      serializePaginationLinks(total, offset, limit, parsedUrl),
    );

    // Serialize any sideloaded models in the included key
    serializeIncludesForJson(models, json);

    return json;
  }

  /**
   * Build the JSON response for a related request for a to-one relationship
   *
   * @method buildSingleRelatedResponse
   * @param {String} relatedPathSegment The URL path segment for the relationship
   * @param {Sequelize.Instance} parentModel The parent Sequelize model instance
   * @param {Sequelize.Instance} relatedModel The related Sequelize model instance
   * @return {Object}
   */
  public buildSingleRelatedResponse(
    relatedPathSegment: string,
    parentModel: Instance<any, any>,
    relatedModel: Instance<any, any>,
  ) {
    const json = {
      data: new JsonApiResourceObject(relatedModel),
      links: {
        self: this.buildRelatedLink(parentModel, relatedPathSegment),
      },
    };

    serializeIncludesForJson(relatedModel, json);

    return json;
  }

  /**
   * Build the JSON response for a related request for a to-many relationship
   *
   * @method buildMultiRelatedResponse
   * @param {String} relatedPathSegment The URL path segment for the relationship
   * @param {Sequelize.Instance} parentModel The parent Sequelize model instance
   * @param {Sequelize.Instance} relatedModels The related Sequelize model instances
   * @return {Object}
   */
  public buildMultiRelatedResponse(
    relatedPathSegment: string,
    parentModel: Instance<any, any>,
    relatedModels: Array<Instance<any, any>>,
  ): any {
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
   * Build the JSON response for a relationships object request for a to-one
   * relationship
   *
   * @method buildRelationshipObjectsSingleResponse
   * @param {String} relatedPathSegment The URL path segment for the relationship
   * @param {Sequelize.Instance} parentModel The parent Sequelize model instance
   * @param {Sequelize.Instance} relatedModel The related Sequelize model instance
   * @return {Object}
   */
  public buildRelationshipObjectsSingleResponse(
    relatedPathSegment: string,
    parentModel: Instance<any, any>,
    relatedModel: Instance<any, any>,
  ): any {
    return {
      data: new ResourceIdentifierObject(relatedModel),
      links: {
        related: this.buildRelatedLink(parentModel, relatedPathSegment),
        self: this.buildRelationshipsLink(parentModel, relatedPathSegment),
      },
    };
  }

  /**
   * Build the JSON response for a relationships object request for a to-many
   * relationship
   *
   * @method buildRelationshipObjectsSingleResponse
   * @param {String} relatedPathSegment The URL path segment for the relationship
   * @param {Sequelize.Instance} parentModel The parent Sequelize model instance
   * @param {Sequelize.Instance[]} relatedModel The related Sequelize model instances
   * @return {Object}
   */
  public buildRelationshipObjectsMultiResponse(
    relatedPathSegment: string,
    parentModel: Instance<any, any>,
    relatedModels: Array<Instance<any, any>>,
  ): any {
    return {
      data: relatedModels.map((model) => new ResourceIdentifierObject(model)),
      links: {
        related: this.buildRelatedLink(parentModel, relatedPathSegment),
        self: this.buildRelationshipsLink(parentModel, relatedPathSegment),
      },
    };
  }

  /**
   * Build the `self` link's value for a related request
   *
   * @method buildRelatedLink
   * @param {Sequelize.Instance} parentModel Sequelize model instance to build `self` link for
   * @param {String} relatedPathSegment The URL path segment for the relationship
   * @return {String}
   */
  private buildRelatedLink(
    parentModel: Instance<any, any>,
    relatedPathSegment: string,
  ): string {
    return `${config.getApiBaseUrl()}/${this.modelType}/${parentModel.get('id')}/${relatedPathSegment}`;
  }

  /**
   * Build the `self` link's value for a relationships request
   *
   * @method buildRelationshipLink
   * @param {Sequelize.Instance} parentModel Sequelize model instance to build `self` link for
   * @param {String} relatedPathSegment The URL path segment for the relationship
   * @return {String}
   */
  private buildRelationshipsLink(
    parentModel: Instance<any, any>,
    relatedPathSegment: string,
  ): string {
    return `${config.getApiBaseUrl()}/${this.modelType}/${parentModel.get('id')}/relationships/${relatedPathSegment}`;
  }
}
