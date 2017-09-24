'use strict';

process.env.NODE_ENV = 'test';

import * as chai from 'chai';
import { Instance, Model } from 'sequelize';
import Serializer from './../../jsonapi/Serializer';
import SequelizeMock = require('sequelize-mock');
import httpMocks = require('node-mocks-http');
import parseurl = require('parseurl');
const dbMock = new SequelizeMock();

chai.should();

function defineMockModel(name: string, attrs: any): Model<any, any> {
  const modelStub = dbMock.define(name, attrs);

  modelStub.attributes = Object.keys(attrs);

  modelStub.getType = (): string => name;

  return modelStub;
}

function defineMockInstanceFromModel(model: Model<any, any>, attrs: any = {}): Instance<any, any> {
  const instance = model.build(attrs);

  instance.attributes = model.attributes;

  instance.getType = (): string => model.name;

  return instance;
}

describe('jsonapi/Serializer', () => {
  describe('#constructor', () => {
    const modelStub = defineMockModel('stub', {});

    const serializer = new Serializer(modelStub);

    serializer.should.be.instanceOf(Serializer);
  });

  describe('#buildSingleModelResponse', () => {
    it('should serialize a single model', () => {
      const modelStub = defineMockModel('foo', {
        email: 'fred.jones@example.com',
        id: 5,
        name: 'Fred Jones',
      });

      const serializer = new Serializer(modelStub);

      const instance = defineMockInstanceFromModel(modelStub);

      const actual = JSON.parse(
        JSON.stringify(serializer.buildSingleModelResponse(instance)),
      );

      actual.should.be.eql(JSON.parse(
        JSON.stringify({
          data: {
            attributes: {
              email: 'fred.jones@example.com',
              name: 'Fred Jones',
            },
            id: '5',
            type: 'foo',
          },
          links: {
            self: 'http://localhost:3000/api/foo/5',
          },
        }),
      ));
    });
  });

  describe('#buildGetListResponse', () => {
    it('should serialize an array of models without relationships or includes', () => {
      const modelStub = defineMockModel('foo', {
        email: 'fred.jones@example.com',
        id: 5,
        name: 'Fred Jones',
      });

      const serializer = new Serializer(modelStub);

      const instances: Array<Instance<any, any>> = [
        defineMockInstanceFromModel(modelStub, {
          email: 'guy1@example.com',
          id: 1,
          name: 'Guy One',
        }),
        defineMockInstanceFromModel(modelStub, {
          email: 'guy2@example.com',
          id: 2,
          name: 'Guy Two',
        }),
        defineMockInstanceFromModel(modelStub, {
          email: 'guy3@example.com',
          id: 3,
          name: 'Guy Three',
        }),
      ];

      // Set each instance's associations to be empty
      instances.forEach((m: Instance<any, any>) => m.Model.associations = []);

      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          page: {
            limit: 3,
            offset: 3,
          },
        },
        url: 'http://localhost:3000/api/foo?page[offset]=3&page[limit]=3',
      });

      const url = parseurl(req);

      const actual = JSON.parse(JSON.stringify(serializer.buildGetListResponse(
        url,
        3,
        3,
        45,
        instances,
      )));

      actual.should.be.eql(JSON.parse(JSON.stringify({
        data: [{
          attributes: {
            email: 'guy1@example.com',
            name: 'Guy One',
          },
          id: '1',
          type: 'foo',
        },
        {
          attributes: {
            email: 'guy2@example.com',
            name: 'Guy Two',
          },
          id: '2',
          type: 'foo',
        },
        {
          attributes: {
            email: 'guy3@example.com',
            name: 'Guy Three',
          },
          id: '3',
          type: 'foo',
        }],
        links: {
          first: 'http://localhost:3000/api/foo?page[offset]=0&page[limit]=3',
          last: 'http://localhost:3000/api/foo?page[offset]=45&page[limit]=3',
          next: 'http://localhost:3000/api/foo?page[offset]=6&page[limit]=3',
          prev: null,
          self: 'http://localhost:3000/api/foo?page[offset]=3&page[limit]=3',
        },
        meta: {
          total: 45,
        },
      })));
    });
  });

  describe('#buildSingleRelatedResponse', () => {
    it('should serialize a related request for a to-one relationship', () => {
      const parentModel = defineMockModel('foo', {
        email: 'fred.jones@example.com',
        id: 5,
        name: 'Fred Jones',
      });

      const relatedModel = defineMockModel('bar', {
        id: 26,
        subject: 'Your favorite foreign movie',
        title: 'Deacon Blues',
      });

      const serializer = new Serializer(parentModel);

      const parentInstance = defineMockInstanceFromModel(parentModel);

      const relatedInstance = defineMockInstanceFromModel(relatedModel);

      const actual = JSON.parse(
        JSON.stringify(serializer.buildSingleRelatedResponse('bar', parentInstance, relatedInstance)),
      );

      actual.should.be.eql(JSON.parse(
        JSON.stringify({
          data: {
            attributes: {
              subject: 'Your favorite foreign movie',
              title: 'Deacon Blues',
            },
            id: '26',
            type: 'bar',
          },
          links: {
            self: 'http://localhost:3000/api/foo/5/bar',
          },
        }),
      ));
    });
  });
});
