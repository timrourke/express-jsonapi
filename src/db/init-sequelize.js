'use strict';

const dbConfig = require('./../config/database.json');
const Sequelize = require('sequelize');

/**
 * Build the mysql connection string from the config data for the current env
 *
 * @return {String}
 */
function buildConnectionString(env = 'development') {
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
function initSequelize() {
  const shouldLogQueries = dbConfig[process.env.NODE_ENV].logging;

  return new Sequelize(buildConnectionString(process.env.NODE_ENV), {
    logging: shouldLogQueries
  });
}

module.exports = initSequelize;
