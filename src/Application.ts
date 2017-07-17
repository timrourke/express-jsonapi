import * as Express from 'express';
import * as Sequelize from 'sequelize';
const Route = require('./route/route');
import Controller from './controllers/controller';
import JsonApiMiddlewareValidateContentType from './jsonapi/middleware/validate-content-type';
import JsonApiMiddlewareValidateRequestBody from './jsonapi/middleware/validate-request-body';
import notFoundHandler from './jsonapi/middleware/not-found-handler';
import InternalServerError from './jsonapi/errors/InternalServerError';

/**
 * Log errors
 *
 * @param {mixed} err An error, if any
 * @param {Express.Request} req The Express request
 * @param {Express.Response} res The Express response
 * @param {Function} next The next Express handler/middleware
 */
function logErrors(err, req, res, next) {
  if (Array.isArray(err)) {
    err.forEach(error => {
      console.error(error.message);
      console.error(error.stack);
    });
  } else {
    console.error(err.message);
    console.error(err.stack);
  }
  next(err, req, res, next);
}

/**
 * Render an internal server error to the client
 *
 * @param {mixed} err An error, if any
 * @param {Express.Request} req The Express request
 * @param {Express.Response} res The Express response
 * @param {Function} next The next Express handler/middleware
 */
function clientErrorHandler(err, req, res, next) { //jshint ignore:line
  res.status(500).json({
    errors: [
      new InternalServerError()
    ]
  });
}

class Application {

    /**
     * Express application instance
     * 
     * @property expressApp
     * @type {Express.Application} expressApp
     */
    private expressApp: Express.Application;

    /**
     * Sequelize DB connection
     * 
     * @property dbConnection
     * @type {Sequelize.Connection} dbConnection
     */
    private dbConnection: Sequelize.Connection;

    /**
     * Models to build resources for
     * 
     * @property models
     * @type {Array<Sequelize.Model<any, any>>}
     */
    private models: Array<Sequelize.Model<any, any>>

    /**
     * Constructor.
     * 
     * @constructor
     * @param {Express.Application} expressApp
     * @param {Sequelize.Connection} dbConnection
     * @param {Array<Sequelize.Model<any, any>>} models
     */
    public constructor(
        expressApp: Express.Application, 
        dbConnection: Sequelize.Connection,
        models: Array<Sequelize.Model<any, any>>
    ) {
        this.expressApp = expressApp;
        this.dbConnection = dbConnection;
        this.models = models;
    }

    /**
     * Get the Express application instance
     * 
     * @return {Express.Application}
     */
    public getExpressApp(): Express.Application {
        return this.expressApp;
    }

    /**
     * Get the Sequelize DB connection
     * 
     * @return {Sequelize.Connection}
     */
    public getDbConnection(): Sequelize.Connection {
        return this.dbConnection;
    }

    /**
     * Configure the Express application's base middlewares
     * 
     * @param {Array<Express.RequestHandler>} middlewares An array of middlewares
     *  to apply to the Express application
     */
    public configureMiddlewares(middlewares: Array<Express.RequestHandler>) {
        middlewares.forEach(middleware => {
            this.expressApp.use(middleware);
        });
    }

    /**
     * Serve the application
     * 
     * @param {mixed} port 
     */
    public serve(port) {
        this.bindHealthCheckRoute();
        this.buildResourcesForModels();
        this.configureClientErrorMiddlewares();

        const PORT_NORMALIZED = this.normalizePort(port);
        this.expressApp.listen(PORT_NORMALIZED);
        console.log('Running on http://localhost:' + PORT_NORMALIZED);
    }

    /**
     * Bind a simple health check route for inspecting server's responsiveness
     */
    private bindHealthCheckRoute() {
        this.expressApp.get('/health',
            function(req: Express.Request, res: Express.Response) {
                res.send('Up.');
            });
    }

    /**
     * Configure middlewares for validating JSON API requests
     */
    private configureJsonApiMiddlewares() {
        // Validate `Content-Type` request header
        this.expressApp.use(JsonApiMiddlewareValidateContentType);

        // Validate request body for PATCH and POST requests to routes under "/api"
        this.expressApp.use(JsonApiMiddlewareValidateRequestBody);
    }

    private buildResourcesForModels() {
        this.configureJsonApiMiddlewares();

        this.models.forEach((model: Sequelize.Model<any, any>) => {
            let route = new Route(this.expressApp, model, Controller);
            
            route.initialize();
        });
    }

    private configureClientErrorMiddlewares() {
        this.expressApp.use(notFoundHandler);
        this.expressApp.use(logErrors);
        this.expressApp.use(clientErrorHandler);
    }

    /**
     * Normalize a port into a number, string, or false.
     * 
     * @param {mixed} val
     * @return {Number|String|Boolean}
     */
    private normalizePort(val: any) {
        const PORT = parseInt(val, 10);

        if (isNaN(PORT)) {
            // named pipe
            return val;
        }

        if (PORT >= 0) {
            // PORT number
            return PORT;
        }

        return false;
    }
}

export default Application;