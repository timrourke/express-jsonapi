'use strict';

const UserAttrs = require('./User');
const PostAttrs = require('./Post');
const inflection = require('inflection');
const StringUtils = require('./../utils/String');

/**
 * Define the models and their relationships and return them as a hash
 *
 * @param {Sequelize.Sequelize} sequelize The Sequelize instance
 * @return {Object}
 */
function defineModels(sequelize) {
  // Define the models
  const User = sequelize.define('user', UserAttrs);
  const Post = sequelize.define('post', PostAttrs);

  // Define the relationships
  User.hasMany(Post);
  Post.belongsTo(User);

  // Add JSON API type lookup to Model prototype
  sequelize.Model.prototype.getType = function() {
    if (!this.hasOwnProperty('_jsonApiType')) {
      this._jsonApiType = inflection.pluralize(
        StringUtils.convertCamelToDasherized(this.name)
      );
    }

    return this._jsonApiType;
  };

  // Alias to JSON API type lookup on Model
  sequelize.Instance.prototype.getType = function() {
    return this.Model.getType();
  };

  return {
    User: User,
    Post: Post,
  };
}

module.exports = defineModels;
