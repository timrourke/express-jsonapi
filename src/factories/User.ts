'use strict';

import Faker = require('faker');

export default (factory) => {
  factory.define('user')
    .sequence('id')
    .attrs({
      createdAt:    () => Faker.date.past(),
      email:        () => Faker.internet.email(),
      firstName:    () => Faker.name.firstName(),
      lastName:     () => Faker.name.lastName(),
      passwordHash: () => Faker.internet.password(60),
      updatedAt:    () => Faker.date.recent(),
    });
};
