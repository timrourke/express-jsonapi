'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
chai.should();
const Controller = require('./../../controllers/controller');

/**
 * Stub for Sequelize.Instance
 *
 * @return {Object}
 */
class ModelInstanceStub {
  findById() {
    return Promise.resolve();
  }

  findAll() {
    return Promise.resolve();
  }

  findAndCountAll() {
    return Promise.resolve({
      count: 0,
      rows: []
    });
  }

  update() {
    return Promise.resolve();
  }

  create() {
    return Promise.resolve();
  }

  destroy() {
    return Promise.resolve();
  }
}

describe('controllers/controller', () => {
  describe('#getOne()', () => {
    it('should return a promise', (done) => {
      let controller = new Controller(new ModelInstanceStub());
      let result = controller.getOne();

      result.should.be.instanceof(Promise);

      result.then(() => {
        // Prove that the result is a promise by using .then()
        done();
      });
    });
  });

  describe('#getList()', () => {
    it('should return a promise', (done) => {
      let controller = new Controller(new ModelInstanceStub());
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
      let controller = new Controller(new ModelInstanceStub());
      let result = controller.createOne();

      result.should.be.instanceof(Promise);

      result.then(() => {
        // Prove that the result is a promise by using .then()
        done();
      });
    });
  });

  describe('#updateOne()', () => {
    it('should return a promise', (done) => {
      let controller = new Controller(new ModelInstanceStub());
      let result = controller.updateOne();

      result.should.be.instanceof(Promise);

      result.then(() => {
        // Prove that the result is a promise by using .then()
        done();
      });
    });
  });

  describe('#deleteOne()', () => {
    it('should return a promise', (done) => {
      let controller = new Controller(new ModelInstanceStub());
      let result = controller.deleteOne();

      result.should.be.instanceof(Promise);

      result.then(() => {
        // Prove that the result is a promise by using .then()
        done();
      });
    });
  });
});
