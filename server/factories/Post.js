'use strict';

const Factory = require('rosie').Factory;
const Faker = require('faker');

module.exports = Factory.define('post')
  .sequence('id')
  .attrs({
    createdAt: () => Faker.date.past(),
    updatedAt: () => Faker.date.recent(),
    body:      () => Faker.lorem.paragraph(),
  });
