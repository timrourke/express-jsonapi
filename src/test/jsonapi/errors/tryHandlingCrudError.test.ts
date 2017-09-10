'use strict';

process.env.NODE_ENV = 'test';

import chai = require('chai');
import tryHandlingCrudError from './../../../jsonapi/errors/tryHandlingCrudError';
import Sequelize = require('sequelize');

import { It, Mock } from 'typemoq';
import { Model } from 'sequelize'; // tslint:disable-line

chai.should();

describe('jsonapi/errors/tryHandlingCrudError', () => {
  it('should reject with error passed if error is not a Sequelize Error', (done) => {
    const originalErr = new Error('This error is not from Sequelize');

    tryHandlingCrudError(originalErr, null)
      .catch((err) => {
        err.should.be.eql(originalErr);

        done();
      });
  });

  it('should reject with error passed if error is not a Sequelize Validation Error', (done) => {
    const originalErr = new Sequelize.Error('This error is not a Sequelize Validation Error');

    tryHandlingCrudError(originalErr, null)
      .catch((err) => {
        err.should.be.eql(originalErr);

        done();
      });
  });

  it('should return correct error object for a unique violation error', (done) => {
    const originalErr = new Sequelize.ValidationError('This is a validation error', [
      {
        message: 'message',
        path: 'fakePath',
        type: 'unique violation',
        value: 'not a snowflake',
      } as Sequelize.ValidationErrorItem,
    ]);

    // Create mock of Sequelize Model
    const mock = Mock.ofType<Model<any, any>>();
    mock.setup((x) => x.name).returns(() => 'fakeModel');

    tryHandlingCrudError(originalErr, mock.object).then((errorData: any) => {
      errorData.status.should.be.eql(422);

      JSON.parse(JSON.stringify(errorData.json))
      .should.be.eql(JSON.parse(JSON.stringify({
        errors: [{
          detail: 'Fake Model\'s fake path must be unique. "not a snowflake" was already chosen.',
          source: {
            pointer: '/data/attributes/fake-path',
          },
          status: 422,
          title: 'Invalid Attribute',
        }],
      })));

      done();
    });
  });

  it('should return correct error object for a not null violation error', (done) => {
    const originalErr = new Sequelize.ValidationError('This is a validation error', [
      {
        path: 'anotherFakePath',
        type: 'notNull Violation',
      } as Sequelize.ValidationErrorItem,
    ]);

    // Create mock of Sequelize Model
    const mock = Mock.ofType<Model<any, any>>();
    mock.setup((x) => x.name).returns(() => 'anotherFakeModel');

    tryHandlingCrudError(originalErr, mock.object).then((errorData: any) => {
      errorData.status.should.be.eql(422);

      JSON.parse(JSON.stringify(errorData.json))
      .should.be.eql(JSON.parse(JSON.stringify({
        errors: [{
          detail: 'Another Fake Model\'s another fake path is required.',
          source: {
            pointer: '/data/attributes/another-fake-path',
          },
          status: 422,
          title: 'Invalid Attribute',
        }],
      })));

      done();
    });
  });

  it('should return correct error object for a default violation error', (done) => {
    const originalErr = new Sequelize.ValidationError('This is a validation error', [
      {
        message: 'This should show up in the error.',
        path: 'somePath',
        type: 'some validation type',
      } as Sequelize.ValidationErrorItem,
    ]);

    // Create mock of Sequelize Model
    const mock = Mock.ofType<Model<any, any>>();
    mock.setup((x) => x.name).returns(() => 'coolModel');

    tryHandlingCrudError(originalErr, mock.object).then((errorData: any) => {
      errorData.status.should.be.eql(422);

      JSON.parse(JSON.stringify(errorData.json))
      .should.be.eql(JSON.parse(JSON.stringify({
        errors: [{
          detail: 'This should show up in the error.',
          source: {
            pointer: '/data/attributes/some-path',
          },
          status: 422,
          title: 'Invalid Attribute',
        }],
      })));

      done();
    });
  });
});
