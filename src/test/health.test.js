process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

describe('health', () => {
  describe('GET /health', () => {
    it('should respond with "Up."', (done) => {
      chai.request(server.app)
        .get('/health')
        .end((err, res) => {
          res.should.have.status(200);
          res.text.should.be.eql('Up.');

          done();
        });
    });
  });
});
