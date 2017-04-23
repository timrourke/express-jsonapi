'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./../../../server');

chai.should();
chai.use(chaiHttp);

describe('jsonapi middleware', () => {
  describe('validate-content-type', () => {
    it('should throw 415 when Content-Type header contains text in addition to "application/vnd.api+json"', (done) => {
      chai.request(server.app)
        .get('/api/users')
        .set('Content-Type', 'application/vnd.api+json; version=2.3')
        .end((err, res) => {
          res.should.have.status(415);

          res.body.should.be.eql({
            errors: [{
              "status": 415,
              "title": "Unsupported Media Type",
              "detail": "Media type parameters or modifications to JSON API Content-Type header not supported (\"application/vnd.api+json; version=2.3\")",
              "links": {
                "about": "http://jsonapi.org/format/#content-negotiation-clients"
              }
            }]
          });

          done();
        });
    });

    it('should throw 400 when Content-Type header is not set', (done) => {
      chai.request(server.app)
        .get('/api/users')
        .end((err, res) => {
          res.should.have.status(400);

          res.body.should.be.eql({
            errors: [{
              status: 400,
              title: 'Bad Request',
              detail: 'Unsupported value for Content-Type header ("")',
              links: {
                about: 'http://jsonapi.org/format/#content-negotiation-clients'
              }
            }]
          });

          done();
        });
    });

    it('should throw 400 when Content-Type header is not "application/vnd.api+json"', (done) => {
      chai.request(server.app)
        .get('/api/users')
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(400);

          res.body.should.be.eql({
            errors: [{
              "status": 400,
              "title": "Bad Request",
              "detail": "Unsupported value for Content-Type header (\"application/json\")",
              "links": {
                "about": "http://jsonapi.org/format/#content-negotiation-clients"
              }
            }]
          });

          done();
        });
    });
  });
});
