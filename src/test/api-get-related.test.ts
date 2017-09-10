'use strict';

process.env.NODE_ENV = 'test';

import * as chai from 'chai';
const chaiHttp = require('chai-http');
import Factory from './../factories/all';
const server = require('../server');

chai.should();
chai.use(chaiHttp);

const models = server.models;

Object.keys(models).forEach(modelName => {
  let model = models[modelName];

  describe(`API - generic test for getting objects related to model ${model.getType()}`, () => {
    afterEach((done) => {
      Promise.all([
        server.db.query('TRUNCATE users'),
        server.db.query('TRUNCATE posts')
      ]).then(() => done());
    });

    it(`should throw 404 when visiting relateds url for non-existent relationship`, (done) => {
      chai.request(server.app)
        .get(`/api/${model.getType()}/1/ghhhsdf3sfdh`)
        .set('Content-Type', 'application/vnd.api+json')
        .end((err, res) => {
          res.should.have.status(404);

          done();
        });
    });

    Object.keys(model.associations).forEach(associationName => {

      describe(`GET /api/${model.getType()}/:id/${associationName}`, () => {
        it('should fetch the correct related objects', (done) => {
          let parentModelDef = Factory.build(modelName, {id: 1});

          model.create(parentModelDef).then(parentModelInstance => {
            let assocUnderTest = model.associations[associationName];

            if (assocUnderTest.isMultiAssociation) {

              // Test getting related objects for a many relationship
              testGettingRelatedObjectsMany(
                associationName,
                model,
                modelName,
                assocUnderTest,
                parentModelInstance
              ).then(() => done()).catch(err => {
                throw err;
              });

            } else {

              // Test getting related objects for a single relationship
              testGettingRelatedObjectsSingle(
                associationName,
                model,
                modelName,
                assocUnderTest,
                parentModelInstance
              ).then(() => done()).catch(err => {
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
 * Test getting related objects for a relationship for a single
 * relation association
 *
 * @param {String} associationName Name of the association
 * @param {Sequelize.Model} model Parent model
 * @param {String} modelName Name of parent model
 * @param {Sequelize.Association} assocUnderTest Association under test
 * @param {Sequelize.Instance} parentModelInstance Parent model instance
 * @return {Promise}
 */
function testGettingRelatedObjectsSingle(
  associationName,
  model,
  modelName,
  assocUnderTest,
  parentModelInstance
) {
  return new Promise((resolve) => {
    let assocModel = assocUnderTest.target;
    let assocModelName = assocModel.name;
    let assocModelDef = Factory.build(assocModelName);

    assocModel.create(assocModelDef).then(inst => {
      parentModelInstance[assocUnderTest.accessors.set](inst).then(() => {
        chai.request(server.app)
          .get(`/api/${model.getType()}/1/${associationName}`)
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
 * Test getting related objects for a relationship for a multiple
 * relation association
 *
 * @param {String} associationName Name of the association
 * @param {Sequelize.Model} model Parent model
 * @param {String} modelName Name of parent model
 * @param {Sequelize.Association} assocUnderTest Association under test
 * @param {Sequelize.Instance} parentModelInstance Parent model instance
 * @return {Promise}
 */
function testGettingRelatedObjectsMany(
  associationName,
  model,
  modelName,
  assocUnderTest,
  parentModelInstance
) {
  return new Promise((resolve, reject) => {
    let assocModel = assocUnderTest.target;
    let assocModelName = assocModel.name;
    let assocModelDefs = Factory.buildList(assocModelName, 3);
    let promises = assocModelDefs.map(def => assocModel.create(def));

    Promise.all(promises).then(assocModelInstances => {
      let relateToParentPromises = assocModelInstances.map(inst => {
        return parentModelInstance[assocUnderTest.accessors.add](inst);
      });

      Promise.all(relateToParentPromises).then(() => {
        chai.request(server.app)
          .get(`/api/${model.getType()}/1/${associationName}`)
          .set('Content-Type', 'application/vnd.api+json')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.data.length.should.be.eql(3);
            res.body.data.forEach(resourceObject => {
              resourceObject.type.should.be.eql(assocModel.getType());
            });

            resolve();
          });
      }).catch(err => {
        console.error(err);
        reject(err);
      });
    }).catch(err => {
      console.error(err);
      reject(err);
    });
  });
}
