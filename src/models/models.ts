'use strict';

import * as Sequelize from 'sequelize';
const UserAttrs = require('./User');
const PostAttrs = require('./Post');
const inflection = require('inflection');
const StringUtils = require('./../utils/String');

declare module 'sequelize' {
  export interface Model<TInstance, TAttributes> {
    getType(): string;
    name: string;
  }

  export interface Instance<TInstance, TAttributes> {
    attributes: Array<string>;    
    getType(): string;
  }
}

// Add JSON API type lookup to Model prototype
Sequelize.Model['prototype'].getType = function() {
  if (!this.hasOwnProperty('_jsonApiType')) {
    this._jsonApiType = inflection.pluralize(
      StringUtils.convertCamelToDasherized(this.name)
    );
  }

  return this._jsonApiType;
};

// Alias to JSON API type lookup on Model
Sequelize.Instance['prototype'].getType = function() {
  return this.Model.getType();
};

/**
 * Define the models and their relationships and return them as a hash
 *
 * @param {Sequelize.Sequelize} sequelize The Sequelize instance
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
    User: User,
    Post: Post,
  };
}