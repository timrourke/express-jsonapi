'use strict';

process.env.NODE_ENV = 'test';

import * as chai from 'chai';
import chaiHttp = require('chai-http');
import server from '../server';
import Factory from './../factories/all';

chai.should();
chai.use(chaiHttp);

const model = server.models.user;

const firstNames = [
  'Fred',
  'Carl',
  'Kathy',
  'Paul',
  'Thomas',
  'Davey',
  'Dave',
  'Pauleen',
  'Carla',
  'Katie',
  'Roger',
  'Sam',
  'Carter',
  'Jennifer',
  'David',
  'Ben',
  'Frank',
  'Jeff',
  'Kevin',
  'Alexis',
];

describe(`API - should sort get list request`, () => {
  afterEach((done) => {
    server.db.query('TRUNCATE users').then(() => done());
  });

  it('should sort users by first name ascending', (done) => {
    seedUsers().then(() => {
      chai.request(server.app)
        .get('/api/users?sort=first-name')
        .set('Content-Type', 'application/vnd.api+json')
        .end((err, res) => {
          const expectedOrder = firstNames.slice().sort();

          res.should.have.status(200);
          res.body.data.length.should.be.eql(20);

          expectedOrder.forEach((expectedFirstName, index) => {
            res.body.data[index].attributes['first-name'].should.be.eql(expectedFirstName);
          });

          done();
        });
    });
  });

});

function seedUsers() {
  return Promise.all(firstNames.map((firstName) => {
    return model.create(Factory.build('user', { firstName }));
  }));
}
