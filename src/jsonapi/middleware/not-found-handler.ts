'use strict';

import NotFoundError from './../errors/NotFoundError';
import config from './../../config/config';
import { NextFunction, Request, Response } from 'express';

export default function(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    errors: [
      new NotFoundError(`Nothing found at ${config.getBaseUrl()}${req.originalUrl}`)
    ]
  });
};
