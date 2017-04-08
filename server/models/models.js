'use strict';

const UserAttrs = require('./User');
const PostAttrs = require('./Post');

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

  return {
    User: User,
    Post: Post,
  };
}

module.exports = defineModels;
