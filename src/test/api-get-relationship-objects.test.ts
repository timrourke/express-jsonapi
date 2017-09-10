'use strict';

process.env.NODE_ENV = 'test';

import * as chai from 'chai';
import chaiHttp = require('chai-http');
import server from '../server';
import Factory from './../factories/all';

chai.should();
chai.use(chaiHttp);

const models = server.models;

Object.keys(models).forEach((modelName) => {
  const model = models[modelName];

  describe(`API - generic test for getting relationship objects for the model ${model.getType()}`, () => {
    afterEach((done) => {
      Promise.all([
        server.db.query('TRUNCATE users'),
        server.db.query('TRUNCATE posts'),
      ]).then(() => done());
    });

    it(`should throw 404 when visiting relationships url without specifying relationship`, (done) => {
      chai.request(server.app)
        .get(`/api/${model.getType()}/1/relationships`)
        .set('Content-Type', 'application/vnd.api+json')
        .end((err, res) => {
          res.should.have.status(404);

          done();
        });
    });

    it(`should throw 404 when visiting relationships url for non-existent relationship`, (done) => {
      chai.request(server.app)
        .get(`/api/${model.getType()}/1/relationships/xxcvbxcvnvxcn`)
        .set('Content-Type', 'application/vnd.api+json')
        .end((err, res) => {
          res.should.have.status(404);

          done();
        });
    });

    Object.keys(model.associations).forEach((associationName) => {

      describe(`GET /api/${model.getType()}/:id/relationships/${associationName}`, () => {
        it('should fetch the correct number of relationship objects', (done) => {
          const parentModelDef = Factory.build(modelName, {id: 1});

          model.create(parentModelDef).then((parentModelInstance) => {
            const assocUnderTest = model.associations[associationName];

            if (assocUnderTest.isMultiAssociation) {

              // Test getting relationship objects for a many relationship
              testGettingRelationshipObjectsMany(
                associationName,
                model,
                modelName,
                assocUnderTest,
                parentModelInstance,
              ).then(() => done()).catch((err) => {
                throw err;
              });

            } else {

              // Test getting relationship objects for a single relationship
              testGettingRelationshipObjectsSingle(
                associationName,
                model,
                modelName,
                assocUnderTest,
                parentModelInstance,
              ).then(() => done()).catch((err) => {
                throw err;
              });

            }
          });
        });
      });
    });

  });
});

/**
 * Test getting relationship objects for a relationship for a single
 * relation association
 *
 * @param {String} associationName Name of the association
 * @param {Sequelize.Model} model Parent model
 * @param {String} modelName Name of parent model
 * @param {Sequelize.Association} assocUnderTest Association under test
 * @param {Sequelize.Instance} parentModelInstance Parent model instance
 * @return {Promise}
 */
function testGettingRelationshipObjectsSingle(
  associationName,
  model,
  modelName,
  assocUnderTest,
  parentModelInstance,
) {
  return new Promise((resolve) => {
    const assocModel = assocUnderTest.target;
    const assocModelName = assocModel.name;
    const assocModelDef = Factory.build(assocModelName);

    assocModel.create(assocModelDef).then((inst) => {
      parentModelInstance[assocUnderTest.accessors.set](inst).then(() => {
        chai.request(server.app)
          .get(`/api/${model.getType()}/1/relationships/${associationName}`)
          .set('Content-Type', 'application/vnd.api+json')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.data.id.should.be.eql(String(inst.id));
            res.body.data.type.should.be.eql(inst.getType());

            resolve();
          });
      });
    });
  });
}

/**
 * Test getting relationship objects for a relationship for a multiple
 * relation association
 *
 * @param {String} associationName Name of the association
 * @param {Sequelize.Model} model Parent model
 * @param {String} modelName Name of parent model
 * @param {Sequelize.Association} assocUnderTest Association under test
 * @param {Sequelize.Instance} parentModelInstance Parent model instance
 * @return {Promise}
 */
function testGettingRelationshipObjectsMany(
  associationName,
  model,
  modelName,
  assocUnderTest,
  parentModelInstance,
) {
  return new Promise((resolve, reject) => {
    const assocModel = assocUnderTest.target;
    const assocModelName = assocModel.name;
    const assocModelDefs = Factory.buildList(assocModelName, 3);
    const promises = assocModelDefs.map((def) => assocModel.create(def));

    Promise.all(promises).then((assocModelInstances) => {
      const relateToParentPromises = assocModelInstances.map((inst) => {
        return parentModelInstance[assocUnderTest.accessors.add](inst);
      });

      Promise.all(relateToParentPromises).then(() => {
        chai.request(server.app)
          .get(`/api/${model.getType()}/1/relationships/${associationName}`)
          .set('Content-Type', 'application/vnd.api+json')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.data.length.should.be.eql(3);
            res.body.data.forEach((resourceIdentifierObject) => {
              resourceIdentifierObject.type.should.be.eql(assocModel.getType());
            });

            resolve();
          });
      }).catch((err) => {
        console.error(err);
        reject(err);
      });
    }).catch((err2) => {
      console.error(err2);
      reject(err2);
    });
  });
}
