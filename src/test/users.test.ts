'use strict';

process.env.NODE_ENV = 'test';

import * as chai from 'chai';
import chaiHttp = require('chai-http');
const server = require('../server');
chai.should();
import sinon = require('sinon');
import Factory from './../factories/all';

chai.use(chaiHttp);

describe('users', () => {
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

  describe('GET /api/users', () => {
    it('should return an array of users', (done) => {
      const users = Factory.buildList('user', 2);

      users.forEach((user) => {
        server.models.user.create(user);
      });

      chai.request(server.app)
        .get('/api/users')
        .set('Content-Type', 'application/vnd.api+json')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.data.length.should.be.eql(2);
          res.body.data[0].type.should.be.eql('users');
          res.body.data[1].type.should.be.eql('users');

          done();
        });
    });

    it('should sideload related posts', (done) => {
      const user = Factory.build('user', { id: 1 });
      server.models.user.create(user);

      Factory.buildList('post', 2).forEach((post, index) => {
        post.id = index + 1;
        post.userId = 1;
        server.models.post.create(post);
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
              detail: 'No users found with the id of 1',
              status: 404,
              title: 'Not Found',
            }],
          });

          done();
        });
    });

    it('should retrieve user by id', (done) => {
      const referenceDate = new Date(0);

      server.models.user.create({
        createdAt: referenceDate,
        email: 'tacobellemployee2@example.com',
        firstName: 'Jane',
        lastName: 'Wiggins',
        passwordHash: 'fake hash',
        updatedAt: referenceDate,
      });

      chai.request(server.app)
        .get('/api/users/1')
        .set('Content-Type', 'application/vnd.api+json')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.eql({
            data: {
              attributes: {
                'created-at': referenceDate.toJSON(),
                'email': 'tacobellemployee2@example.com',
                'first-name': 'Jane',
                'last-name': 'Wiggins',
                'password-hash': 'fake hash',
                'updated-at': referenceDate.toJSON(),
              },
              id: '1',
              relationships: {
                posts: {
                  links: {
                    related: 'http://localhost:3000/api/users/1/posts',
                    self: 'http://localhost:3000/api/users/1/relationships/posts',
                  },
                },
              },
              type: 'users',
            },
            links: {
              self: 'http://localhost:3000/api/users/1',
            },
          });

          done();
        });
    });
  });

  describe('GET /api/users/1/posts', () => {
    it('should retrieve posts related to user', (done) => {
      const userModel = server.models.user;
      const postModel = server.models.post;
      const user = Factory.build('user', { id: 1 });
      const posts = Factory.buildList('post', 4, { userId: 1 });
      const unrelatedPost = Factory.build('post', { userId: 2 });

      const promises = [
        userModel.create(user),
        postModel.create(unrelatedPost),
      ].concat(posts.map((p) => postModel.create(p)));

      Promise.all(promises).then(() => {
        chai.request(server.app)
        .get('/api/users/1/posts')
        .set('Content-Type', 'application/vnd.api+json')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.data.length.should.be.eql(4);

          done();
        });
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
            attributes: {
              'email': 'tim.smith@example.com',
              'first-name': 'Tim',
              'last-name': 'Smith',
              'password-hash': 'fake password hash',
            },
            type: 'users',
          },
        })
        .end((err, res) => {
          const attrs = res.body.data.attributes;

          res.should.have.status(201);
          res.body.data.type.should.be.eql('users');
          attrs.email.should.be.eql('tim.smith@example.com');
          attrs['first-name'].should.be.eql('Tim');
          attrs['last-name'].should.be.eql('Smith');

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
            attributes: {
              'email': 'sammysports1@example.com',
              'first-name': 'Samantha',
              'last-name': 'von Berg',
              'password-hash': 'fake password hash',
            },
            id: 1,
            type: 'users',
          },
        })
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.eql({
            data: null,
            errors: [{
              detail: 'No users found with the id of 1',
              status: 404,
              title: 'Not Found',
            }],
          });

          done();
        });
    });

    it('should update user', (done) => {
      server.models.user.create({
        email: 'roncarlin@example.com',
        firstName: 'Ronald',
        lastName: 'C',
        passwordHash: 'fake password hash',
      });

      chai.request(server.app)
        .patch('/api/users/1')
        .set('Content-Type', 'application/vnd.api+json')
        .send({
          data: {
            attributes: {
              'email': 'rcarlin87@wisconsinu.edu',
              'first-name': 'Ron',
              'last-name': 'Carlin',
              'password-hash': 'fake password hash',
            },
            id: 1,
            type: 'users',
          },
        })
        .end((err, res) => {
          const attrs = res.body.data.attributes;

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
        .del('/api/users/1')
        .set('Content-Type', 'application/vnd.api+json')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.eql({
            data: null,
            errors: [{
              detail: 'No users found with the id of 1',
              status: 404,
              title: 'Not Found',
            }],
          });

          done();
        });
    });

    it('should delete user', (done) => {
      server.models.user.create({
        email: 'cubsfan25@example.edu',
        firstName: 'Jerry',
        id: 1,
        lastName: 'Schwarz',
        passwordHash: 'fake password hash',
      });

      chai.request(server.app)
        .del('/api/users/1')
        .set('Content-Type', 'application/vnd.api+json')
        .end((err, res) => {
          res.should.have.status(204);
          res.body.should.be.eql({});

          done();
        });
    });
  });
});
