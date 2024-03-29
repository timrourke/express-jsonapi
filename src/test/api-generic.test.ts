'use strict';

process.env.NODE_ENV = 'test';

import * as chai from 'chai';
import chaiHttp = require('chai-http');
import server from '../server';
import inflection = require('inflection');
import sinon = require('sinon');
import Factory from './../factories/all';
import StringUtils from './../utils/String';

chai.should();
chai.use(chaiHttp);

const models = server.models;

Object.keys(models).forEach((modelName) => {
  const model = models[modelName];
  const modelType = model.getType();

  describe(`API - generic test for model ${modelType}`, () => {
    let fakeClock = null;

    beforeEach((done) => {
      fakeClock = sinon.useFakeTimers();

      Promise.all([
        server.db.query('TRUNCATE users'),
        server.db.query('TRUNCATE posts'),
      ]).then(() => done());
    });

    afterEach(() => {
      fakeClock.restore();
    });

    describe(`GET /api/${modelType}`, () => {
      it(`should return empty array when no ${modelType} exist`, (done) => {
        chai.request(server.app)
          .get(`/api/${modelType}`)
          .set('Content-Type', 'application/vnd.api+json')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.data.should.be.eql([]);

            done();
          });
      });

      it(`should return an array of ${modelType}`, (done) => {
        const modelDefinitions = Factory.buildList(modelName, 2);

        modelDefinitions.forEach((def, index) => {
          def.id = index + 1;
          model.create(def);
        });

        chai.request(server.app)
          .get(`/api/${modelType}`)
          .set('Content-Type', 'application/vnd.api+json')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.data.length.should.be.eql(2);
            res.body.data[0].type.should.be.eql(modelType);
            res.body.data[1].type.should.be.eql(modelType);

            done();
          });
      });
    });

    describe(`GET /api/${modelType}/:id`, () => {
      it(`should throw 404 when ${modelName} does not exist`, (done) => {
        chai.request(server.app)
          .get(`/api/${modelType}/1`)
          .set('Content-Type', 'application/vnd.api+json')
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.eql({
              data: null,
              errors: [{
                detail: `No ${modelType} found with the id of 1`,
                status: 404,
                title: 'Not Found',
              }],
            });

            done();
          });
      });

      it(`should retrieve ${modelName} by id`, (done) => {
        const modelDefinition = Factory.build(modelName);

        model.create(modelDefinition);

        chai.request(server.app)
          .get(`/api/${modelType}/${modelDefinition.id}`)
          .set('Content-Type', 'application/vnd.api+json')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.data.type.should.be.eql(modelType);
            res.body.data.id.should.be.eql(String(modelDefinition.id));
            res.body.links.self.should.be.eql(`http://localhost:3000/api/${modelType}/${modelDefinition.id}`);

            done();
          });
      });
    });

    describe(`POST /api/${modelType}`, () => {
      it(`should throw 422 when \`data\` member does not exist`, (done) => {
        chai.request(server.app)
          .post(`/api/${modelType}`)
          .set('Content-Type', 'application/vnd.api+json')
          .send({})
          .end((err, res) => {
            res.should.have.status(422);
            res.body.errors.length.should.be.eql(1);

            done();
          });
      });

      it(`should throw 422 when \`data.type\` member does not exist`, (done) => {
        chai.request(server.app)
          .post(`/api/${modelType}`)
          .set('Content-Type', 'application/vnd.api+json')
          .send({
            data: {},
          })
          .end((err, res) => {
            res.should.have.status(422);
            res.body.errors.length.should.be.eql(1);

            done();
          });
      });

      it(`should throw 403 when \`id\` member is defined by client`, (done) => {
        chai.request(server.app)
          .post(`/api/${modelType}`)
          .set('Content-Type', 'application/vnd.api+json')
          .send({
            data: {
              id: 583,
              type: modelType,
            },
          })
          .end((err, res) => {
            res.should.have.status(403);
            res.body.errors.length.should.be.eql(1);

            done();
          });
      });

      it(`should create ${modelName}`, (done) => {
        const modelDefinition = Factory.build(modelName);
        modelDefinition.id = 1;
        const attrs = {};

        Object.keys(modelDefinition).forEach((key) => {
          if (key !== 'id') {
            attrs[key] = modelDefinition[key];
          }
        });

        chai.request(server.app)
          .post(`/api/${modelType}`)
          .set('Content-Type', 'application/vnd.api+json')
          .send({
            data: {
              attributes: attrs,
              type: modelType,
            },
          })
          .end((err, res) => {
            res.should.have.status(201);
            res.body.data.type.should.be.eql(modelType);
            res.body.data.id.should.be.eql('1');

            done();
          });
      });
    });

    describe(`PATCH /api/${modelType}`, () => {
      const modelDefinition = Factory.build(modelName);
      modelDefinition.id = 1;

      const modelDefinition2 = Factory.build(modelName);
      modelDefinition2.id = 1;
      const attrs2 = {};

      Object.keys(modelDefinition2).forEach((key) => {
        if (['id', 'createdAt', 'updatedAt'].indexOf(key) === -1) {
          attrs2[key] = modelDefinition2[key];
        }
      });

      it(`should throw 422 when \`data\` member does not exist`, (done) => {
        chai.request(server.app)
          .patch(`/api/${modelType}/1`)
          .set('Content-Type', 'application/vnd.api+json')
          .send({})
          .end((err, res) => {
            res.should.have.status(422);
            res.body.errors.length.should.be.eql(1);

            done();
          });
      });

      it(`should throw 422 when \`data.type\` member does not exist`, (done) => {
        chai.request(server.app)
          .patch(`/api/${modelType}/1`)
          .set('Content-Type', 'application/vnd.api+json')
          .send({
            data: {
              id: 1,
            },
          })
          .end((err, res) => {
            res.should.have.status(422);
            res.body.errors.length.should.be.eql(1);

            done();
          });
      });

      it(`should throw 422 when \`data.id\` member does not exist`, (done) => {
        chai.request(server.app)
          .patch(`/api/${modelType}/1`)
          .set('Content-Type', 'application/vnd.api+json')
          .send({
            data: {
              type: modelType,
            },
          })
          .end((err, res) => {
            res.should.have.status(422);
            res.body.errors.length.should.be.eql(1);

            done();
          });
      });

      it(`should throw 422 when \`data.id\` and \`data.type\` members do not exist`, (done) => {
        chai.request(server.app)
          .patch(`/api/${modelType}/1`)
          .set('Content-Type', 'application/vnd.api+json')
          .send({
            data: {},
          })
          .end((err, res) => {
            res.should.have.status(422);
            res.body.errors.length.should.be.eql(2);

            done();
          });
      });

      it(`should throw 404 when ${modelName} does not exist`, (done) => {
        chai.request(server.app)
          .patch(`/api/${modelType}/1`)
          .set('Content-Type', 'application/vnd.api+json')
          .send({
            data: {
              attributes: attrs2,
              id: 1,
              type: modelType,
            },
          })
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.eql({
              data: null,
              errors: [{
                detail: `No ${modelType} found with the id of 1`,
                status: 404,
                title: 'Not Found',
              }],
            });

            done();
          });
      });

      it(`should update ${modelName}`, (done) => {
        model.create(modelDefinition);

        chai.request(server.app)
          .patch(`/api/${modelType}/1`)
          .set('Content-Type', 'application/vnd.api+json')
          .send({
            data: {
              attributes: attrs2,
              id: 1,
              type: modelType,
            },
          })
          .end((err, res) => {
            const actualAttrs = res.body.data.attributes;
            const expectedAttrs = {};

            Object.keys(attrs2).forEach((key) => {
              const dasherized = StringUtils.convertCamelToDasherized(key);

              expectedAttrs[dasherized] = attrs2[key];
            });

            res.should.have.status(200);
            res.body.data.type.should.be.eql(modelType);

            Object.keys(expectedAttrs).forEach((expectedKey) => {
              actualAttrs[expectedKey].should.be.eql(expectedAttrs[expectedKey]);
            });

            done();
          });
      });
    });

    describe(`DELETE /api/${modelType}/:id`, () => {
      it(`should throw 404 when ${modelName} does not exist`, (done) => {
        chai.request(server.app)
          .del(`/api/${modelType}/1`)
          .set('Content-Type', 'application/vnd.api+json')
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.eql({
              data: null,
              errors: [{
                detail: `No ${modelType} found with the id of 1`,
                status: 404,
                title: 'Not Found',
              }],
            });

            done();
          });
      });

      it(`should delete ${modelName}`, (done) => {
        const modelDefinition = Factory.build(modelName);
        modelDefinition.id = 1;
        model.create(modelDefinition);

        chai.request(server.app)
          .del(`/api/${modelType}/1`)
          .set('Content-Type', 'application/vnd.api+json')
          .end((err, res) => {
            res.should.have.status(204);
            res.body.should.be.eql({});

            chai.request(server.app)
              .get(`/api/${modelType}/${modelDefinition.id}`)
              .set('Content-Type', 'application/vnd.api+json')
              .end((err2, res2) => {
                res2.should.have.status(404);
                res2.body.should.be.eql({
                  data: null,
                  errors: [{
                    detail: `No ${modelType} found with the id of 1`,
                    status: 404,
                    title: 'Not Found',
                  }],
                });

                done();
            });
          });
      });
    });
  });
});
