process.env.NODE_ENV = 'test';
import validateRequestBody from './../../../jsonapi/middleware/validate-request-body';
import express = require('express');
import httpMocks = require('node-mocks-http');
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
    ].forEach((testCase) => {
      const [
        method,
        url,
      ] = testCase;

      it(`should call next middleware handler if request method is ${method} and request url is ${url}`, () => {
        let nextWasCalled = false;

        const req = httpMocks.createRequest({
          method: method as httpMocks.RequestMethod,
          url,
        });

        const res = httpMocks.createResponse();

        const next = (err) => {
          nextWasCalled = true;

          return;
        };

        validateRequestBody(req, res, next);

        nextWasCalled.should.be.true; // tslint:disable-line
        res.statusCode.should.be.eql(200);
      });
    });

    it('should respond with error when "data" member not present', () => {
      const req = httpMocks.createRequest({
        body: {},
        method: 'POST',
        url: '/api',
      });

      const res = httpMocks.createResponse();

      validateRequestBody(req, res, () => null);

      res.statusCode.should.be.eql(422);

      const responseBody = JSON.parse(res._getData());
      responseBody.errors.length.should.be.eql(1);
      responseBody.errors[0].should.be.eql({
        detail: 'Missing `data` Member at document\'s top level.',
        source: {
          pointer: '',
        },
        status: 422,
        title: 'Unprocessable Entity',
      });
    });

    it('should respond with error when "data.type" member not present', () => {
      const req = httpMocks.createRequest({
        body: {
          data: {},
        },
        method: 'POST',
        url: '/api',
      });

      const res = httpMocks.createResponse();

      validateRequestBody(req, res, () => null);

      res.statusCode.should.be.eql(422);

      const responseBody = JSON.parse(res._getData());
      responseBody.errors.length.should.be.eql(1);
      responseBody.errors[0].should.be.eql({
        detail: 'Invalid Resource Object. Missing `data.type` Member at Resource Object\'s top level.',
        links: {
          about: 'http://jsonapi.org/format/#document-resource-objects',
        },
        source: {
          pointer: '/data',
        },
        status: 422,
        title: 'Unprocessable Entity',
      });
    });

    it('should respond with error when "data.id" member not present in PATCH request', () => {
      const req = httpMocks.createRequest({
        body: {
          data: {
            type: 'foo',
          },
        },
        method: 'PATCH',
        url: '/api',
      });

      const res = httpMocks.createResponse();

      validateRequestBody(req, res, () => null);

      res.statusCode.should.be.eql(422);

      const responseBody = JSON.parse(res._getData());
      responseBody.errors.length.should.be.eql(1);
      responseBody.errors[0].should.be.eql({
        detail: 'Invalid Resource Object for PATCH request. Missing `data.id` Member at Resource Object\'s top level.',
        links: {
          about: 'http://jsonapi.org/format/#document-resource-objects',
        },
        source: {
          pointer: '/data',
        },
        status: 422,
        title: 'Unprocessable Entity',
      });
    });

    it('should respond with errors when "data.id" and "data.type" members not present in PATCH request', () => {
      const req = httpMocks.createRequest({
        body: {
          data: {},
        },
        method: 'PATCH',
        url: '/api',
      });

      const res = httpMocks.createResponse();

      validateRequestBody(req, res, () => null);

      res.statusCode.should.be.eql(422);

      const responseBody = JSON.parse(res._getData());
      responseBody.errors.length.should.be.eql(2);
    });

    it('should respond with error if client provides an ID in a POST request', () => {
      const req = httpMocks.createRequest({
        body: {
          data: {
            id: 'should-not-have-client-provided-id',
            type: 'foo',
          },
        },
        method: 'POST',
        url: '/api',
      });

      const res = httpMocks.createResponse();

      validateRequestBody(req, res, () => null);

      res.statusCode.should.be.eql(403);

      const responseBody = JSON.parse(res._getData());
      responseBody.errors.length.should.be.eql(1);
      responseBody.errors[0].should.be.eql({
        detail: 'Invalid Resource Object for POST request. Client-generated IDs for requests to create new resources is unsupported.',
        links: {
          about: 'http://jsonapi.org/format/#crud-creating',
        },
        source: {
          pointer: '/data/id',
        },
        status: 403,
        title: 'Forbidden',
      });
    });

    it('should respond with errors if "data.type" member is omitted and "data.id" member is provided by client', () => {
      const req = httpMocks.createRequest({
        body: {
          data: {
            id: 'should-not-have-client-provided-id',
          },
        },
        method: 'POST',
        url: '/api',
      });

      const res = httpMocks.createResponse();

      validateRequestBody(req, res, () => null);

      res.statusCode.should.be.eql(403);

      const responseBody = JSON.parse(res._getData());
      responseBody.errors.length.should.be.eql(2);
    });
  });
});
