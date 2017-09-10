import {
    Application as ExpressApp,
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express';
import * as Sequelize from 'sequelize';
import Controller from './controllers/controller';
import InternalServerError from './jsonapi/errors/InternalServerError';
import notFoundHandler from './jsonapi/middleware/not-found-handler';
import JsonApiMiddlewareValidateContentType from './jsonapi/middleware/validate-content-type';
import JsonApiMiddlewareValidateRequestBody from './jsonapi/middleware/validate-request-body';
import Route from './route/route';

/**
 * Express middleware to log errors to stderr
 *
 * @param {Error} err An error, if any
 * @param {Express.Request} req The Express request
 * @param {Express.Response} res The Express response
 * @param {Express.NextFunction} next The next Express handler/middleware
 * @return {void}
 */
function logErrors(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (Array.isArray(err)) {
    err.forEach((error) => {
      console.error(error.message);
      console.error(error.stack);
    });
  } else {
    console.error(err.message);
    console.error(err.stack);
  }

  next(err);
}

/**
 * Render an internal server error to the client
 *
 * @param {Error} err An error, if any
 * @param {Express.Request} req The Express request
 * @param {Express.Response} res The Express response
 * @param {Express.NextFunction} next The next Express handler/middleware
 * @return {void}
 */
function clientErrorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  res.status(500).json({
    errors: [
      new InternalServerError(),
    ],
  });
}

/**
 * The Application class defines, configures, and runs the application
 *
 * @class Application
 */
export default class Application {

    /**
     * Express application instance
     *
     * @property expressApp
     * @type {Express.Application} expressApp
     */
    private expressApp: ExpressApp;

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
    private models: Array<Sequelize.Model<any, any>>;

    /**
     * Constructor.
     *
     * @constructor
     * @param {Express.Application} expressApp
     * @param {Sequelize.Connection} dbConnection
     * @param {Array<Sequelize.Model<any, any>>} models
     * @return {void}
     */
    public constructor(
        expressApp: ExpressApp,
        dbConnection: Sequelize.Connection,
        models: Array<Sequelize.Model<any, any>>,
    ) {
        this.expressApp = expressApp;
        this.dbConnection = dbConnection;
        this.models = models;
    }

    /**
     * Get the Express application instance
     *
     * @method getExpressApp
     * @return {Express.Application}
     */
    public getExpressApp(): ExpressApp {
        return this.expressApp;
    }

    /**
     * Get the Sequelize DB connection
     *
     * @method getDbConnection
     * @return {Sequelize.Connection}
     */
    public getDbConnection(): Sequelize.Connection {
        return this.dbConnection;
    }

    /**
     * Configure the Express application's base middlewares
     *
     * @method configureMiddlewares
     * @param {Express.RequestHandler[]} middlewares An array of middlewares
     *  to apply to the Express application
     * @return {void}
     */
    public configureMiddlewares(middlewares: RequestHandler[]): void {
        middlewares.forEach((middleware) => {
            this.expressApp.use(middleware);
        });
    }

    /**
     * Serve the application
     *
     * @method serve
     * @param {mixed} port
     * @return {void}
     */
    public serve(port): void {
        this.bindHealthCheckRoute();
        this.buildResourcesForModels();
        this.configureClientErrorMiddlewares();

        const PORT_NORMALIZED = this.normalizePort(port);
        this.expressApp.listen(PORT_NORMALIZED);
        console.log('Running on http://localhost:' + PORT_NORMALIZED);
    }

    /**
     * Bind a simple health check route for inspecting server's responsiveness
     *
     * @method bindHealthCheckRoute
     * @return {void}
     */
    private bindHealthCheckRoute(): void {
        this.expressApp.get('/health',
            (req: Request, res: Response) => {
                res.send('Up.');
            });
    }

    /**
     * Configure middlewares for validating JSON API requests
     *
     * @method configureJsonApiMiddlewares
     * @return {void}
     */
    private configureJsonApiMiddlewares(): void {
        // Validate `Content-Type` request header
        this.expressApp.use(JsonApiMiddlewareValidateContentType);

        // Validate request body for PATCH and POST requests to routes under "/api"
        this.expressApp.use(JsonApiMiddlewareValidateRequestBody);
    }

    /**
     * Build JSON API resources for all models.
     *
     * Attaches middlewares for validating JSON API request compliance.
     *
     * @method buildResourcesForModels
     * @return {void}
     */
    private buildResourcesForModels(): void {
        // Attach middlewares for validating JSON API request compliance
        this.configureJsonApiMiddlewares();

        this.models.forEach((model: Sequelize.Model<any, any>) => {
            const route = new Route(this.expressApp, model, Controller);

            route.initialize();
        });
    }

    /**
     * Configures middleware stack for gracefully presenting the client with unhandled errors
     *
     * @method configureClientErrorMiddlewares
     * @return {void}
     */
    private configureClientErrorMiddlewares(): void {
        this.expressApp.use(notFoundHandler);
        this.expressApp.use(logErrors);
        this.expressApp.use(clientErrorHandler);
    }

    /**
     * Normalize a port into a number, string, or false.
     *
     * @method normalizePort
     * @param {mixed} val Value to use for binding the server to a port
     * @return {Number|String|Boolean}
     */
    private normalizePort(val: any): number|string|boolean {
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
