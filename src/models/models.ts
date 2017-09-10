'use strict';

import * as Sequelize from 'sequelize';
const UserAttrs = require('./User'); // tslint:disable-line
const PostAttrs = require('./Post'); // tslint:disable-line
import inflection = require('inflection');
const StringUtils = require('./../utils/String'); // tslint:disable-line

// Add JSON API type lookup to Model prototype
Sequelize.Model['prototype'].getType = function(): string { // tslint:disable-line
  if (!this.hasOwnProperty('_jsonApiType')) {
    this._jsonApiType = inflection.pluralize(
      StringUtils.convertCamelToDasherized(this.name),
    );
  }

  return this._jsonApiType;
};

// Alias to JSON API type lookup on Model
Sequelize.Instance['prototype'].getType = function(): string { // tslint:disable-line
  return this.Model.getType();
};

/**
 * Define the models and their relationships and return them as a hash
 *
 * @param {Sequelize.Connection} sequelize The Sequelize instance
 * @return {Object}
 */
export function defineModels(sequelize: Sequelize.Connection) {
  // Define the models
  const User = sequelize.define('user', UserAttrs);
  const Post = sequelize.define('post', PostAttrs);

  // Define the relationships
  User.hasMany(Post);
  Post.belongsTo(User);

  return {
    User,
    Post,
  };
}
