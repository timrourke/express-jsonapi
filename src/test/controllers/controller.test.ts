'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const Bluebird = require('bluebird');

import Controller from './../../controllers/controller';
import { It, Mock } from 'typemoq';
import { Model } from 'sequelize';

// Create mock of Sequelize Model
let mock = Mock.ofType<Model<any, any>>();

mock.setup(x => x.findById(It.isAny()))
  .returns(() => Bluebird.resolve());

mock.setup(x => x.findAndCountAll(It.isAny()))
  .returns(() => Bluebird.resolve());

mock.setup(x => x.create(It.isAny()))
  .returns(() => Bluebird.resolve());

mock.setup(x => x.update(It.isAny(), It.isAny()))
  .returns(() => Bluebird.resolve());

mock.setup(x => x.destroy(It.isAny()))
  .returns(() => Bluebird.resolve());

chai.should();

describe('controllers/controller', () => {
  describe('#getOne()', () => {
    it('should return a promise', (done) => {
      let controller = new Controller(mock.object);
      let result = controller.getOne(1);

      result.should.be.instanceof(Promise);

      result.then(() => {
        // Prove that the result is a promise by using .then()
        done();
      });
    });
  });

  describe('#getList()', () => {
    it('should return a promise', (done) => {
      let controller = new Controller(mock.object);
      let result = controller.getList();

      result.should.be.instanceof(Promise);

      result.then(() => {
        // Prove that the result is a promise by using .then()
        done();
      });
    });
  });

  describe('#createOne()', () => {
    it('should return a promise', (done) => {
      let controller = new Controller(mock.object);
      let result = controller.createOne({});

      result.should.be.instanceof(Promise);

      result.then(() => {
        // Prove that the result is a promise by using .then()
        done();
      });
    });
  });

  describe('#updateOne()', () => {
    it('should return a promise', (done) => {
      let controller = new Controller(mock.object);
      let result = controller.updateOne(1, {});

      result.should.be.instanceof(Promise);

      result.then(() => {
        // Prove that the result is a promise by using .then()
        done();
      });
    });
  });

  describe('#deleteOne()', () => {
    it('should return a promise', (done) => {
      let controller = new Controller(mock.object);
      let result = controller.deleteOne(1);

      result.should.be.instanceof(Promise);

      result.then(() => {
        // Prove that the result is a promise by using .then()
        done();
      });
    });
  });
});
