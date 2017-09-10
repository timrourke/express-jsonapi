'use strict';

process.env.NODE_ENV = 'test';

import * as chai from 'chai';
import GetListRequest from './../../jsonapi/GetListRequest';
import httpMocks = require('node-mocks-http');
import SequelizeMock = require('sequelize-mock');
const dbMock = new SequelizeMock();

chai.should();

describe('jsonapi/GetListRequest', () => {
  describe('#constructor()', () => {
    it('should parse request without params', (done) => {
      const modelStub = dbMock.define('stub', {});

      const request = new GetListRequest(httpMocks.createRequest({}), modelStub);

      request.validate().then((actual) => {
        actual.should.be.eql({
          include: [],
          limit: 20,
          offset: 0,
          order: [],
        });

        done();
      });
    });

    it('should reject with errors if sorted with invalid attributes', (done) => {
      const req = httpMocks.createRequest({
        query: {
          sort: 'this-attr-is-invalid',
        },
      });

      const modelStub = dbMock.define('stub', {
        bar: true,
        foo: true,
      });

      const request = new GetListRequest(req, modelStub);

      request.validate().catch((actual) => {
        JSON.stringify(actual).should.be.eql(JSON.stringify(
          [{
            status: 400,
            title: 'Bad Request',
            detail: 'Cannot sort by "this-attr-is-invalid". The resource does not have an attribute called "this-attr-is-invalid"', // tslint:disable-line
            source: {
              parameter: 'sort',
            },
          }],
        ));
      });

      done();
    });

    it('should parse sort param', (done) => {
      const req = httpMocks.createRequest({
        query: {
          sort: 'foo,-bar,-hooty-hoo,baz,seventy-three',
        },
      });

      const modelStub = dbMock.define('stub', {
        bar: true,
        baz: true,
        foo: true,
        hootyHoo: true,
        seventyThree: true,
      });

      const request = new GetListRequest(req, modelStub);

      request.validate().then((actual: any) => {
        actual.order.should.be.eql([
          ['foo', 'ASC'],
          ['bar', 'DESC'],
          ['hootyHoo', 'DESC'],
          ['baz', 'ASC'],
          ['seventyThree', 'ASC'],
        ]);

        done();
      });
    });

    it('should parse include param', () => {
      const req = httpMocks.createRequest({
        query: {
          include: 'foo,bar,foo.bingo,foo.bongo.ding,foo.bongo.dang,bar.toot,foo.bongo.ding.ring,foo.bongo.ding.rang',
        },
      });

      const modelStub = dbMock.define('stub', {});

      const foo   = dbMock.define('foo', {});
      const bar   = dbMock.define('bar', {});
      const bingo = dbMock.define('bingo', {});
      const bongo = dbMock.define('bongo', {});
      const ding  = dbMock.define('ding', {});
      const ring  = dbMock.define('ring', {});
      const rang  = dbMock.define('rang', {});
      const dang  = dbMock.define('dang', {});
      const toot  = dbMock.define('toot', {});

      foo.belongsTo(modelStub);
      bingo.belongsTo(foo);
      bongo.belongsTo(foo);
      ding.belongsTo(bongo);
      ring.belongsTo(ding);
      rang.belongsTo(ding);
      dang.belongsTo(bongo);
      bar.belongsTo(modelStub);
      toot.belongsTo(bar);

      const request = new GetListRequest(req, modelStub);
      const actual = request.getInclude();
      const expected = {
        bar: {
          toot: {},
        },
        foo: {
          bingo: {},
          bongo: {
            dang: {},
            ding: {
              rang: {},
              ring: {},
            },
          },
        },
      };

      actual.should.be.eql(expected);
    });
  });

  describe('#validate()', () => {
    // Build model stubs
    const fooModelStub     = dbMock.define('foo', {});
    const barModelStub     = dbMock.define('bar', {});
    const bazModelStub     = dbMock.define('baz', {});
    const bizBangModelStub = dbMock.define('bizBang', {});

    // Relate model stubs
    fooModelStub.hasMany(barModelStub, {as: 'bars'});
    barModelStub.belongsTo(fooModelStub);
    barModelStub.belongsTo(bazModelStub);
    bazModelStub.hasMany(bizBangModelStub);

    // Stub associations data structure to maintain compatibility with the
    // internal API of Sequelize models
    barModelStub.associations = {
      baz: {
        target: bazModelStub,
      },
    };
    bazModelStub.associations = {
      'biz-bangs': {
        target: bizBangModelStub,
      },
    };
    bizBangModelStub.associations = {};
    fooModelStub.associations = {
      bars: {
        target: barModelStub,
      },
    };

    it('should parse include param', (done) => {
      const params = {
        query: {
          include: 'bars,bars.baz,bars.baz.biz-bangs',
        },
      };

      const expected = {
        include: [{
          include: [{
            include: [{
              model: bizBangModelStub,
            }],
            model: bazModelStub,
          }],
          model: barModelStub,
        }],
      };

      const req = httpMocks.createRequest(params);

      const request = new GetListRequest(req, fooModelStub);

      request.validate().then((sequelizeQueryParams: any) => {
        sequelizeQueryParams.include.should.be.eql(expected.include);

        done();
      });
    });

    it('should parse include param when param is empty', (done) => {
      const params = {
        query: {},
      };

      const expected = {
        include: [],
      };

      const req = httpMocks.createRequest(params);

      const request = new GetListRequest(req, fooModelStub);

      request.validate().then((sequelizeQueryParams: any) => {
        sequelizeQueryParams.include.should.be.eql(expected.include);

        done();
      });
    });

    it('should create errors when include param contains invalid models', (done) => {
      const params = {
        query: {
          include: 'bars,bars.baz,bars.baz.boing,bang,bing.bong',
        },
      };

      const req = httpMocks.createRequest(params);

      const request = new GetListRequest(req, fooModelStub);

      request.validate().catch((errors) => {
        errors.length.should.be.eql(3);

        const errorsString = JSON.stringify(errors);

        errorsString.should.have
          .string('The model \\"foo\\" has no relationship \\"bang\\"');

        errorsString.should.have
          .string('The model \\"foo\\" has no relationship \\"bing\\"');

        errorsString.should.have
          .string('The model \\"baz\\" has no relationship \\"boing\\"');

        done();
      });
    });

    it('should create errors when mutually exclusive "page[offset]" and "page[number]" params are set', (done) => {
      const req = httpMocks.createRequest({
        query: {
          page: {
            number: 10,
            offset: 10,
          },
        },
      });

      const modelStub = dbMock.define('stub', {});

      const request = new GetListRequest(req, modelStub);

      request.validate().catch((errors) => {
        errors.length.should.be.eql(1);

        JSON.stringify(errors).should.have
          .string('Use of \\"page[number]\\" and \\"page[offset]\\" as pagination params are mutually exclusive.');

        done();
      });
    });

    it('should create errors when mutually exclusive "page[limit]" and "page[size]" params are set', (done) => {
      const req = httpMocks.createRequest({
        query: {
          page: {
            limit: 10,
            size: 10,
          },
        },
      });

      const modelStub = dbMock.define('stub', {});

      const request = new GetListRequest(req, modelStub);

      request.validate().catch((errors) => {
        errors.length.should.be.eql(1);

        JSON.stringify(errors).should.have
          .string('Use of \\"page[limit]\\" and \\"page[size]\\" as pagination params are mutually exclusive.');

        done();
      });
    });

    [
      'offset',
      'limit',
      'size',
      'number',
    ].forEach((param) => {
      it(`should create errors when "page[${param}]" is not numeric`, (done) => {
        const page = {};
        page[param] = 'this is not numeric';

        const requestParams = {
          query: {
            page,
          },
        };

        const req = httpMocks.createRequest(requestParams);

        const modelStub = dbMock.define('stub', {});

        const request = new GetListRequest(req, modelStub);

        request.validate().catch((errors) => {
          errors.length.should.be.eql(1);

          JSON.stringify(errors).should.have
            .string(`Invalid pagination param \\"page[${param}]\\" (\\"this is not numeric\\"). \\"page[${param}]\\" must be a number.`); // tslint:disable-line

          done();
        });
      });
    });

    [
      ['offset', 0],
      ['limit', 0],
      ['size', 0],
      ['number', 1],
    ].forEach((testCase) => {
      const [param, minimum] = testCase;

      it(`should create errors when "page[${param}]" is less than ${minimum}`, (done) => {
        const page = {};
        page[param] = -1;

        const requestParams = {
          query: {
            page,
          },
        };

        const req = httpMocks.createRequest(requestParams);

        const modelStub = dbMock.define('stub', {});

        const request = new GetListRequest(req, modelStub);

        request.validate().catch((errors) => {
          errors.length.should.be.eql(1);

          JSON.stringify(errors).should.have
            .string(`Invalid pagination param \\"page[${param}]\\" (\\"-1\\"). \\"page[${param}]\\" must not be a number lower than ${minimum}`); // tslint:disable-line

          done();
        });
      });
    });

    [/*  page                      expectedOffset  expectedLimit */
      [{ offset: 34, limit: 8  },  34,             8],
      [{ limit:  30            },  0,              30],
      [{ offset: 73            },  73,             20],
      [{ number: 15, size:  11 },  154,            11],
      [{ number: 19            },  360,            20],
      [{ size:   62            },  0,              62],
      [{},                         0,              20],
    ].forEach((testCase) => {
      const [page, expectedOffset, expectedLimit] = testCase;

      it(`should parse valid pagination params ${JSON.stringify(page)}`, (done) => {
        const requestParams = {
          query: {
            page,
          },
        };

        const req = httpMocks.createRequest(requestParams);

        const modelStub = dbMock.define('stub', {});

        const request = new GetListRequest(req, modelStub);

        request.validate().then((sequelizeQueryParams: any) => {
          sequelizeQueryParams.offset.should.be.eql(expectedOffset);
          sequelizeQueryParams.limit.should.be.eql(expectedLimit);

          done();
        });
      });
    });
  });
});
