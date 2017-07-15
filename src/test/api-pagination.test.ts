'use strict';

process.env.NODE_ENV = 'test';

import * as chai from 'chai';
const chaiHttp = require('chai-http');
const Factory = require('./../factories/all');
const server = require('../server');

chai.should();
chai.use(chaiHttp);

describe(`API - should paginate get list request`, () => {
  before((done) => {
    let userDefinitions = Factory.buildList('user', 117);
    let promises = [];

    userDefinitions.forEach(def => {
      promises.push(server.models.user.create(def));
    });

    Promise.all(promises).then(() => done());
  });

  after((done) => {
    server.db.query('TRUNCATE users').then(() => done());
  });

  it('should default to offset 0 limit 20 when no query params defined', (done) => {
    chai.request(server.app)
      .get('/api/users')
      .set('Content-Type', 'application/vnd.api+json')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.length.should.be.eql(20);
        res.body.links.should.be.eql({
          self:  'http://localhost:3000/api/users',
          first: 'http://localhost:3000/api/users?page[offset]=0&page[limit]=20',
          last:  'http://localhost:3000/api/users?page[offset]=100&page[limit]=20',
          next:  'http://localhost:3000/api/users?page[offset]=20&page[limit]=20',
          prev:  null
        });

        done();
      });
  });

  it('should show params in links', (done) => {
    chai.request(server.app)
      .get('/api/users?tacos=4&page[offset]=0&dog=woof&page[limit]=20')
      .set('Content-Type', 'application/vnd.api+json')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.length.should.be.eql(20);
        res.body.links.should.be.eql({
          self:  'http://localhost:3000/api/users?tacos=4&page[offset]=0&dog=woof&page[limit]=20',
          first: 'http://localhost:3000/api/users?tacos=4&dog=woof&page[offset]=0&page[limit]=20',
          last:  'http://localhost:3000/api/users?tacos=4&dog=woof&page[offset]=100&page[limit]=20',
          next:  'http://localhost:3000/api/users?tacos=4&dog=woof&page[offset]=20&page[limit]=20',
          prev:  null
        });

        done();
      });
  });

  it('should show next and previous links', (done) => {
    chai.request(server.app)
      .get('/api/users?tacos=4&page[offset]=80&dog=woof&page[limit]=20')
      .set('Content-Type', 'application/vnd.api+json')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.length.should.be.eql(20);
        res.body.links.should.be.eql({
          self:  'http://localhost:3000/api/users?tacos=4&page[offset]=80&dog=woof&page[limit]=20',
          first: 'http://localhost:3000/api/users?tacos=4&dog=woof&page[offset]=0&page[limit]=20',
          last:  'http://localhost:3000/api/users?tacos=4&dog=woof&page[offset]=100&page[limit]=20',
          next:  'http://localhost:3000/api/users?tacos=4&dog=woof&page[offset]=100&page[limit]=20',
          prev:  'http://localhost:3000/api/users?tacos=4&dog=woof&page[offset]=60&page[limit]=20',
        });

        done();
      });
  });

  it('should hide next link when on last page', (done) => {
    chai.request(server.app)
      .get('/api/users?tacos=4&page[offset]=100&dog=woof&page[limit]=20')
      .set('Content-Type', 'application/vnd.api+json')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.length.should.be.eql(17);
        res.body.links.should.be.eql({
          self:  'http://localhost:3000/api/users?tacos=4&page[offset]=100&dog=woof&page[limit]=20',
          first: 'http://localhost:3000/api/users?tacos=4&dog=woof&page[offset]=0&page[limit]=20',
          last:  'http://localhost:3000/api/users?tacos=4&dog=woof&page[offset]=100&page[limit]=20',
          next:  null,
          prev:  'http://localhost:3000/api/users?tacos=4&dog=woof&page[offset]=80&page[limit]=20',
        });

        done();
      });
  });
});
