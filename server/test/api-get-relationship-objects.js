'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const Factory = require('./../factories/all');
const server = require('../server');

chai.should();
chai.use(chaiHttp);

const models = server.models;

Object.keys(models).forEach(modelName => {
  let model = models[modelName];

  describe(`API - generic test for model ${model.getType()}`, () => {
    afterEach((done) => {
      Promise.all([
        server.db.query('TRUNCATE users'),
        server.db.query('TRUNCATE posts')
      ]).then(() => done());
    });

    Object.keys(model.associations).forEach(associationName => {

      describe(`GET /api/${model.getType()}/:id/relationships/${associationName}`, () => {
        it('should fetch the correct number of relationship objects', (done) => {
          let parentModelDef = Factory.build(modelName, {id: 1});

          model.create(parentModelDef).then(parentModelInstance => {
            let assocUnderTest = model.associations[associationName];

            if (assocUnderTest.isMultiAssociation) {

              // Test getting relationship objects for a many relationship
              testGettingRelationshipObjectsMany(
                associationName,
                model,
                modelName,
                assocUnderTest,
                parentModelInstance
              ).then(() => done()).catch(err => {
                throw err;
              });

            } else {

              // Test getting relationship objects for a single relationship
              testGettingRelationshipObjectsSingle(
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
  parentModelInstance
) {
  return new Promise((resolve) => {
    let assocModel = assocUnderTest.target;
    let assocModelName = assocModel.name;
    let assocModelDef = Factory.build(assocModelName);

    assocModel.create(assocModelDef).then(inst => {
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
          .get(`/api/${model.getType()}/1/relationships/${associationName}`)
          .set('Content-Type', 'application/vnd.api+json')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.data.length.should.be.eql(3);

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
