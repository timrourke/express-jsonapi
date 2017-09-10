process.env.NODE_ENV = 'test';

import * as chai from 'chai';
import chaiHttp = require('chai-http');
import server from '../server';

const should = chai.should();

chai.use(chaiHttp);

describe('health', () => {
  describe('GET /health', () => {
    it('should respond with "Up."', (done) => {
      chai.request(server.app)
        .get('/health')
        .end((err, res: any) => {
          res.should.have.status(200);
          res.text.should.be.eql('Up.');

          done();
        });
    });
  });
});
