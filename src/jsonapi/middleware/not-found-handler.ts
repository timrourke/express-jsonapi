'use strict';

import {
  NextFunction,
  Request,
  Response,
} from 'express';
import config from './../../config/config';
import NotFoundError from './../errors/NotFoundError';

/**
 * Renders a 404 Not Found error
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Express.NextFunction} next
 * @return {void}
 */
export default function(req: Request, res: Response, next: NextFunction): void {
  res.status(404).json({
    errors: [
      new NotFoundError(`Nothing found at ${config.getBaseUrl()}${req.originalUrl}`),
    ],
  });
}
