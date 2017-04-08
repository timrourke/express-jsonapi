'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
chai.should();
const sinon = require('sinon');

chai.use(chaiHttp);

describe('users', () => {
  let fakeClock = null;

  beforeEach((done) => {
    fakeClock = sinon.useFakeTimers();

    Promise.all([
      server.db.query('TRUNCATE users'),
      server.db.query('TRUNCATE posts')
    ]).then(() => done());
  });

  afterEach(() => {
    fakeClock.restore();
  });

  describe('GET /api/users', () => {
    it('should return empty array when no users exist', (done) => {
      chai.request(server.app)
        .get('/api/users')
        .set('Content-Type', 'application/vnd.api+json')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.eql({
            links: {
              self: 'http://localhost:3000/api/users'
            },
            data: []
          });

          done();
        });
    });

    it('should return an array of users', (done) => {
      server.models.user.create({
        firstName: 'Jane',
        lastName: 'Wiggins',
        email: 'tacobellemployee2@example.com',
        passwordHash: 'fake hash'
      });

      server.models.user.create({
        firstName: 'Richard',
        lastName: 'Smith',
        email: 'rsmith4@example.com',
        passwordHash: 'fake hash'
      });

      chai.request(server.app)
        .get('/api/users')
        .set('Content-Type', 'application/vnd.api+json')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.data.length.should.be.eql(2);
          res.body.data[0].type.should.be.eql('users');
          res.body.data[0].id.should.be.eql('1');
          res.body.data[1].type.should.be.eql('users');
          res.body.data[1].id.should.be.eql('2');

          done();
        });
    });

    it('should sideload related posts', (done) => {
      server.models.user.create({
        firstName: 'Jane',
        lastName: 'Wiggins',
        email: 'tacobellemployee2@example.com',
        passwordHash: 'fake hash'
      });

      server.models.post.create({
        body: 'This is a test 1.',
        userId: '1'
      });

      server.models.post.create({
        body: 'This is a test 2.',
        userId: '1'
      });

      chai.request(server.app)
        .get('/api/users?include=posts')
        .set('Content-Type', 'application/vnd.api+json')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.data.length.should.be.eql(1);
          res.body.data[0].type.should.be.eql('users');
          res.body.data[0].id.should.be.eql('1');
          res.body.included.length.should.be.eql(2);
          res.body.included[0].type.should.be.eql('posts');
          res.body.included[1].type.should.be.eql('posts');
          res.body.included[0].id.should.be.eql('1');
          res.body.included[1].id.should.be.eql('2');

          done();
        });
    });
  });

  describe('GET /api/users/:id', () => {
    it('should throw 404 when user does not exist', (done) => {
      chai.request(server.app)
        .get('/api/users/1')
        .set('Content-Type', 'application/vnd.api+json')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.eql({
            data: null,
            errors: [{
              status: 404,
              title: 'Not Found',
              detail: 'No users found with the id of 1'
            }]
          });

          done();
        });
    });

    it('should retrieve user by id', (done) => {
      let referenceDate = new Date(0);

      server.models.user.create({
        firstName: 'Jane',
        lastName: 'Wiggins',
        email: 'tacobellemployee2@example.com',
        createdAt: referenceDate,
        updatedAt: referenceDate,
        passwordHash: 'fake hash'
      });

      chai.request(server.app)
        .get('/api/users/1')
        .set('Content-Type', 'application/vnd.api+json')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.eql({
            data: {
              type: 'users',
              id: '1',
              attributes: {
                'first-name': 'Jane',
                'last-name': 'Wiggins',
                email: 'tacobellemployee2@example.com',
                'password-hash': 'fake hash',
                'created-at': referenceDate.toJSON(),
                'updated-at': referenceDate.toJSON()
              },
              relationships: {
                posts: {
                  links: {
                    self: 'http://localhost:3000/api/users/1/relationships/posts',
                    related: 'http://localhost:3000/api/users/1/posts'
                  }
                }
              }
            },
            links: {
              self: 'http://localhost:3000/api/users/1'
            }
          });

          done();
        });
    });
  });

  describe('POST /api/users', () => {
    it('should create user', (done) => {
      chai.request(server.app)
        .post('/api/users')
        .set('Content-Type', 'application/vnd.api+json')
        .send({
          data: {
            type: 'users',
            attributes: {
              firstName: 'Tim',
              lastName: 'Smith',
              email: 'tim.smith@example.com'
            }
          }
        })
        .end((err, res) => {
          let attrs = res.body.data.attributes;

          res.should.have.status(200);
          res.body.data.type.should.be.eql('users');
          attrs.email.should.be.eql('tim.smith@example.com');
          attrs.firstName.should.be.eql('Tim');
          attrs.lastName.should.be.eql('Smith');

          done();
        });
    });
  });

  describe('PATCH /api/users', () => {
    it('should throw 404 when user does not exist', (done) => {
      chai.request(server.app)
        .patch('/api/users/1')
        .set('Content-Type', 'application/vnd.api+json')
        .send({
          data: {
            type: 'users',
            attributes: {
              firstName: 'Samantha',
              lastName: 'von Berg',
              email: 'sammysports1@example.com'
            }
          }
        })
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.eql({
            data: null,
            errors: [{
              status: 404,
              title: 'Not Found',
              detail: 'No users found with the id of 1'
            }]
          });

          done();
        });
    });

    it('should update user', (done) => {
      server.models.user.create({
        'firstName': 'Ronald',
        'lastName': 'C',
        'email': 'roncarlin@example.com'
      });

      chai.request(server.app)
        .patch('/api/users/1')
        .set('Content-Type', 'application/vnd.api+json')
        .send({
          data: {
            type: 'users',
            attributes: {
              firstName: 'Ron',
              lastName: 'Carlin',
              email: 'rcarlin87@wisconsinu.edu'
            }
          }
        })
        .end((err, res) => {
          let attrs = res.body.data.attributes;

          res.should.have.status(200);
          res.body.data.type.should.be.eql('users');
          attrs.email.should.be.eql('rcarlin87@wisconsinu.edu');
          attrs['first-name'].should.be.eql('Ron');
          attrs['last-name'].should.be.eql('Carlin');

          done();
        });
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should throw 404 when user does not exist', (done) => {
      chai.request(server.app)
        .delete('/api/users/1')
        .set('Content-Type', 'application/vnd.api+json')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.eql({
            data: null,
            errors: [{
              status: 404,
              title: 'Not Found',
              detail: 'No users found with the id of 1'
            }]
          });

          done();
        });
    });

    it('should delete user', (done) => {
      server.models.user.create({
        'firstName': 'Jerry',
        'lastName': 'Schwarz',
        'email': 'cubsfan25@example.edu'
      });

      chai.request(server.app)
        .delete('/api/users/1')
        .set('Content-Type', 'application/vnd.api+json')
        .end((err, res) => {
          res.should.have.status(204);
          res.body.should.be.eql({});

          done();
        });
    });
  });
});
