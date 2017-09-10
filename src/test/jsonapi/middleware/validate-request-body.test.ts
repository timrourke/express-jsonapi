process.env.NODE_ENV = 'test';
import validateRequestBody from './../../../jsonapi/middleware/validate-request-body';
const express = require('express');
const httpMocks = require('node-mocks-http');
import * as chai from 'chai';

chai.should();

describe('jsonapi middleware', () => {
  describe('validate-request-body', () => {

    [
    /* method     url    */
      ['GET',     '/api'],
      ['DELETE',  '/api'],
      ['HEAD',    '/api'],
      ['OPTIONS', '/api'],
      ['PATCH',   '/notApiRequest'],
      ['POST',    '/notApiRequest'],
    ].forEach(testCase => {
      let [
        method,
        url
      ] = testCase;

      it(`should call next middleware handler if request method is ${method} and request url is ${url}`, () => {
        let nextWasCalled = false;

        let req = httpMocks.createRequest({
          method: method,
          url: url
        });

        let res = httpMocks.createResponse();

        let next = function(err) {
          nextWasCalled = true;

          return;
        };

        validateRequestBody(req, res, next); 

        nextWasCalled.should.be.true;
        res.statusCode.should.be.eql(200);
      });
    });

    it('should respond with error when "data" member not present', () => {
      let req = httpMocks.createRequest({
        method: 'POST',
        url: '/api',
        body: {}
      });

      let res = httpMocks.createResponse();

      validateRequestBody(req, res, ()=>{});

      res.statusCode.should.be.eql(422);

      const responseBody = JSON.parse(res._getData());
      responseBody.errors.length.should.be.eql(1);
      responseBody.errors[0].should.be.eql({
        title: "Unprocessable Entity",
        detail: "Missing `data` Member at document's top level.",
        source: {
          pointer: ''
        },
        status: 422,
      });
    });

    it('should respond with error when "data.type" member not present', () => {
      let req = httpMocks.createRequest({
        method: 'POST',
        url: '/api',
        body: {
          data: {}
        }
      });

      let res = httpMocks.createResponse();

      validateRequestBody(req, res, ()=>{});

      res.statusCode.should.be.eql(422);

      const responseBody = JSON.parse(res._getData());
      responseBody.errors.length.should.be.eql(1);
      responseBody.errors[0].should.be.eql({
        title: "Unprocessable Entity",
        detail: "Invalid Resource Object. Missing `data.type` Member at Resource Object's top level.",
        links: {
          about: 'http://jsonapi.org/format/#document-resource-objects',
        },
        source: {
          pointer: '/data'
        },
        status: 422,
      });
    });

    it('should respond with error when "data.id" member not present in PATCH request', () => {
      let req = httpMocks.createRequest({
        method: 'PATCH',
        url: '/api',
        body: {
          data: {
            type: 'foo'
          }
        }
      });

      let res = httpMocks.createResponse();

      validateRequestBody(req, res, ()=>{});

      res.statusCode.should.be.eql(422);

      const responseBody = JSON.parse(res._getData());
      responseBody.errors.length.should.be.eql(1);
      responseBody.errors[0].should.be.eql({
        title: "Unprocessable Entity",
        detail: "Invalid Resource Object for PATCH request. Missing `data.id` Member at Resource Object's top level.",
        links: {
          about: 'http://jsonapi.org/format/#document-resource-objects',
        },
        source: {
          pointer: '/data'
        },
        status: 422,
      });
    });

    it('should respond with errors when "data.id" and "data.type" members not present in PATCH request', () => {
      let req = httpMocks.createRequest({
        method: 'PATCH',
        url: '/api',
        body: {
          data: {
          }
        }
      });

      let res = httpMocks.createResponse();

      validateRequestBody(req, res, ()=>{});

      res.statusCode.should.be.eql(422);

      const responseBody = JSON.parse(res._getData());
      responseBody.errors.length.should.be.eql(2);
    });

    it('should respond with error if client provides an ID in a POST request', () => {
      let req = httpMocks.createRequest({
        method: 'POST',
        url: '/api',
        body: {
          data: {
            type: 'foo',
            id: 'should-not-have-client-provided-id'
          }
        }
      })

      let res = httpMocks.createResponse();

      validateRequestBody(req, res, ()=>{});

      res.statusCode.should.be.eql(403);

      const responseBody = JSON.parse(res._getData());
      responseBody.errors.length.should.be.eql(1);
      responseBody.errors[0].should.be.eql({
        title: 'Forbidden',
        detail: 'Invalid Resource Object for POST request. Client-generated IDs for requests to create new resources is unsupported.',
        links: {
          about: 'http://jsonapi.org/format/#crud-creating',
        },
        source: {
          pointer: '/data/id',
        },
        status: 403,
      });
    });

    it('should respond with errors if "data.type" member is omitted and "data.id" member is provided by client', () => {
      let req = httpMocks.createRequest({
        method: 'POST',
        url: '/api',
        body: {
          data: {
            id: 'should-not-have-client-provided-id'
          }
        }
      })

      let res = httpMocks.createResponse();

      validateRequestBody(req, res, ()=>{});

      res.statusCode.should.be.eql(403);

      const responseBody = JSON.parse(res._getData());
      responseBody.errors.length.should.be.eql(2);
    });
  });
});
