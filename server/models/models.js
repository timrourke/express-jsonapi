'use strict';

const UserAttrs = require('./User');
const PostAttrs = require('./Post');

module.exports = (sequelize) => {
  // Define the models
  const User = sequelize.define('user', UserAttrs);
  const Post = sequelize.define('post', PostAttrs);

  // Define the relationships
  User.hasMany(Post);
  Post.belongsTo(User);

  return {
    User: User,
    Post: Post
  };
}
