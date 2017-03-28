'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      },
      firstName: {
        type: Sequelize.STRING,
        defaultValue: false,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        defaultValue: false,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        defaultValue: false,
        allowNull: false
      },
      passwordHash: {
        type: Sequelize.STRING,
        defaultValue: false,
        allowNull: false
      }
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('users');
  }
};
