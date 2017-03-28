'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addIndex('users',
      ['email'],
      {
        indexName: 'email',
        indicesType: 'UNIQUE'
    });
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeIndex('users', 'email');
  }
};
