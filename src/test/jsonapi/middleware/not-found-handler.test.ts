process.env.NODE_ENV = 'test';

import * as chai from 'chai';
const chaiHttp = require('chai-http');
const server = require('./../../../server');

chai.should();
chai.use(chaiHttp);

describe(`JSON API middleware - not found handler`, () => {
  it('should throw a Not Found error when a route is invalid', (done) => {
    chai.request(server.app)
      .get('/this/does/not/exist')
      .set('Content-Type', 'application/vnd.api+json')
      .end((err, res) => {
        res.should.have.status(404);
        res.body.errors[0].should.be.eql({
          status: 404,
          title: 'Not Found',
          detail: 'Nothing found at http://localhost:3000/this/does/not/exist'
        });

        done();
      });
  });
});
