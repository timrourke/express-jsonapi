'use strict';

const Sequelize = require('sequelize');

module.exports = {
  createdAt: {
    type: Sequelize.DATE
  },
  updatedAt: {
    type: Sequelize.DATE
  },
  firstName: {
    type: Sequelize.STRING,
    defaultValue: false,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  lastName: {
    type: Sequelize.STRING,
    defaultValue: false,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  email: {
    type: Sequelize.STRING,
    defaultValue: false,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: Sequelize.STRING,
    defaultValue: false,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
};
