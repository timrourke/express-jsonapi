'use strict';

import Faker = require('faker');

export default (factory) => {
  factory.define('post')
    .sequence('id')
    .attrs({
      body:      () => Faker.lorem.paragraph(),
      createdAt: () => Faker.date.past(),
      updatedAt: () => Faker.date.recent(),
    });
  };
