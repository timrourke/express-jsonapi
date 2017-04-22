'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    // Remove the defaultValue from the firstName column
    queryInterface.changeColumn(
      'users',
      'firstName',
      {
        type: Sequelize.STRING,
        allowNull: false
      });

    // Remove the defaultValue from the lastName column
    queryInterface.changeColumn(
      'users',
      'lastName',
      {
        type: Sequelize.STRING,
        allowNull: false
      });
  },

  down: function (queryInterface, Sequelize) {

    // Put the defaultValue back onto the firstName column
    queryInterface.changeColumn(
      'users',
      'firstName',
      {
        type: Sequelize.STRING,
        defaultValue: false,
        allowNull: false
      });

    // Put the defaultValue back onto the lastName column
    queryInterface.changeColumn(
      'users',
      'lastName',
      {
        type: Sequelize.STRING,
        defaultValue: false,
        allowNull: false
      });
  }
};
