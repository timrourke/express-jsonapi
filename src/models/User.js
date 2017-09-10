'use strict';

const Sequelize = require('sequelize');

/**
 * Define a configuration hash to describe a non-nullable, non-empty string field for a model definition
 *
 * @param {String} errorMessage Message to display to user on a validation error
 * @return {Object}
 */
function defineNonNullableNonEmptyString(errorMessage) {
  return {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: errorMessage,
      },
    },
  };
}

module.exports = {
  createdAt: {
    type: Sequelize.DATE,
  },
  updatedAt: {
    type: Sequelize.DATE,
  },
  firstName: defineNonNullableNonEmptyString("User's first name is required."),
  lastName: defineNonNullableNonEmptyString("User's last name is required."),
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: "User's email is required.",
      },
      isEmail: {
        args: true,
        msg: "User's email must be a valid email address.",
      },
    },
  },
  passwordHash: defineNonNullableNonEmptyString("User's password is required."),
};
