'use strict';

const dbConfig = require('./../config/database.json');
import * as Sequelize from 'sequelize';

/**
 * Build the mysql connection string from the config data for the current env
 *
 * @return {String}
 */
function buildConnectionString(env: string = 'development'): string {
  const connectionData = dbConfig[env];
  const user = connectionData.username;
  const pass = connectionData.password ?
    ':' + connectionData.password
    : '';
  const host = connectionData.host;
  const db = connectionData.database;

  return `mysql://${user}${pass}@${host}/${db}`;
}

/**
 * Intializes the Sequelize instance
 *
 * @return {Sequelize}
 */
export default function initSequelize(): Sequelize.Connection {
  const shouldLogQueries = dbConfig[process.env.NODE_ENV].logging;

  return new Sequelize(buildConnectionString(process.env.NODE_ENV), {
    logging: shouldLogQueries
  });
}
