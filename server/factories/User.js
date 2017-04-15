'use strict';

const Factory = require('rosie').Factory;
const Faker = require('faker');

module.exports = Factory.define('user')
  .sequence('id')
  .attrs({
    createdAt:    () => Faker.date.past(),
    updatedAt:    () => Faker.date.recent(),
    firstName:    () => Faker.name.firstName(),
    lastName:     () => Faker.name.lastName(),
    email:        () => Faker.internet.email(),
    passwordHash: () => Faker.internet.password(60),
  });
