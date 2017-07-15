'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
import tryHandlingCrudError from './../../../jsonapi/errors/tryHandlingCrudError';
const Sequelize = require('sequelize');

import { It, Mock } from 'typemoq';
import { Model } from 'sequelize';

chai.should();

describe('jsonapi/errors/tryHandlingCrudError', () => {
  it('should reject with error passed if error is not a Sequelize Error', (done) => {
    let originalErr = new Error('This error is not from Sequelize');

    tryHandlingCrudError(originalErr, null)
      .then(() => {})
      .catch(err => {
        err.should.be.eql(originalErr);

        done();
      });
  });

  it('should reject with error passed if error is not a Sequelize Validation Error', (done) => {
    let originalErr = new Sequelize.Error('This error is not a Sequelize Validation Error');

    tryHandlingCrudError(originalErr, null)
      .then(() => {})
      .catch(err => {
        err.should.be.eql(originalErr);

        done();
      });
  });

  it('should return correct error object for a unique violation error', (done) => {
    let originalErr = new Sequelize.ValidationError('This is a validation error', [
      {
        path: 'fakePath',
        type: 'unique violation',
        value: 'not a snowflake'
      }
    ]);

    // Create mock of Sequelize Model
    let mock = Mock.ofType<Model<any, any>>();
    mock.setup(x => x.name).returns(() => 'fakeModel');

    tryHandlingCrudError(originalErr, mock.object).then((errorData: any) => {
      errorData.status.should.be.eql(422);

      JSON.stringify(errorData.json).should.be.eql(JSON.stringify({
        errors: [{
          status: 422,
          title: 'Invalid Attribute',
          detail: 'Fake Model\'s fake path must be unique. "not a snowflake" was already chosen.',
          source: {
            pointer: '/data/attributes/fake-path'
          }
        }]
      }));

      done();
    });
  });

  it('should return correct error object for a not null violation error', (done) => {
    let originalErr = new Sequelize.ValidationError('This is a validation error', [
      {
        path: 'anotherFakePath',
        type: 'notNull Violation',
      }
    ]);

    // Create mock of Sequelize Model
    let mock = Mock.ofType<Model<any, any>>();
    mock.setup(x => x.name).returns(() => 'anotherFakeModel');

    tryHandlingCrudError(originalErr, mock.object).then((errorData: any) => {
      errorData.status.should.be.eql(422);

      JSON.stringify(errorData.json).should.be.eql(JSON.stringify({
        errors: [{
          status: 422,
          title: 'Invalid Attribute',
          detail: 'Another Fake Model\'s another fake path is required.',
          source: {
            pointer: '/data/attributes/another-fake-path'
          }
        }]
      }));

      done();
    });
  });

  it('should return correct error object for a default violation error', (done) => {
    let originalErr = new Sequelize.ValidationError('This is a validation error', [
      {
        path: 'somePath',
        type: 'some validation type',
        message: 'This should show up in the error.',
      }
    ]);

    // Create mock of Sequelize Model
    let mock = Mock.ofType<Model<any, any>>();
    mock.setup(x => x.name).returns(() => 'coolModel');

    tryHandlingCrudError(originalErr, mock.object).then((errorData: any) => {
      errorData.status.should.be.eql(422);

      JSON.stringify(errorData.json).should.be.eql(JSON.stringify({
        errors: [{
          status: 422,
          title: 'Invalid Attribute',
          detail: 'This should show up in the error.',
          source: {
            pointer: '/data/attributes/some-path'
          }
        }]
      }));

      done();
    });
  });
});
