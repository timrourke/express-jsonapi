'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    // Remove the defaultValue from the email column
    queryInterface.changeColumn(
      'users',
      'email',
      {
        type: Sequelize.STRING,
        allowNull: false
      });

    // Remove the defaultValue from the passwordHash column
    queryInterface.changeColumn(
      'users',
      'passwordHash',
      {
        type: Sequelize.STRING,
        allowNull: false
      });
  },

  down: function (queryInterface, Sequelize) {

    // Put the defaultValue back onto the email column
    queryInterface.changeColumn(
      'users',
      'email',
      {
        type: Sequelize.STRING,
        defaultValue: false,
        allowNull: false,
      });

    // Put the defaultValue back onto the passwordHash column
    queryInterface.changeColumn(
      'users',
      'passwordHash',
      {
        type: Sequelize.STRING,
        defaultValue: false,
        allowNull: false,
      });
  }
};
