'use strict';

process.env.NODE_ENV = 'test';

import * as chai from 'chai';
import GetListRequest from './../../jsonapi/GetListRequest';
const httpMocks = require('node-mocks-http');
const SequelizeMock = require('sequelize-mock');
const dbMock = new SequelizeMock();

chai.should();

describe('jsonapi/GetListRequest', () => {
  describe('#constructor()', () => {
    it('should parse request without params', (done) => {
      let modelStub = dbMock.define('stub', {});

      let request = new GetListRequest(httpMocks.createRequest({}), modelStub);

      request.validate().then(actual => {
        actual.should.be.eql({
          limit: 20,
          offset: 0,
          include: [],
          order: []
        });

        done();
      });
    });

    it('should reject with errors if sorted with invalid attributes', (done) => {
      let req = httpMocks.createRequest({
        query: {
          sort: 'this-attr-is-invalid'
        }
      });

      let modelStub = dbMock.define('stub', {
        foo: true,
        bar: true
      });

      let request = new GetListRequest(req, modelStub);

      request.validate().catch(actual => {
        JSON.stringify(actual).should.be.eql(JSON.stringify(
          [{
            status: 400,
            title: 'Bad Request',
            detail: 'Cannot sort by "this-attr-is-invalid". The resource does not have an attribute called "this-attr-is-invalid"',
            source: {
              parameter: 'sort'
            }
          }]
        ));
      });

      done();
    });

    it('should parse sort param', (done) => {
      let req = httpMocks.createRequest({
        query: {
          sort: 'foo,-bar,-hooty-hoo,baz,seventy-three'
        }
      });

      let modelStub = dbMock.define('stub', {
        foo: true,
        bar: true,
        hootyHoo: true,
        baz: true,
        seventyThree: true
      })

      let request = new GetListRequest(req, modelStub);

      request.validate().then((actual: any) => {
        actual.order.should.be.eql([
          ['foo', 'ASC'],
          ['bar', 'DESC'],
          ['hootyHoo', 'DESC'],
          ['baz', 'ASC'],
          ['seventyThree', 'ASC']
        ]);

        done();
      });
    });

    it('should parse include param', () => {
      let req = httpMocks.createRequest({
        query: {
          include: 'foo,bar,foo.bingo,foo.bongo.ding,foo.bongo.dang,bar.toot,foo.bongo.ding.ring,foo.bongo.ding.rang'
        }
      });

      let modelStub = dbMock.define('stub', {});

      let foo   = dbMock.define('foo', {});
      let bar   = dbMock.define('bar', {});
      let bingo = dbMock.define('bingo', {});
      let bongo = dbMock.define('bongo', {});
      let ding  = dbMock.define('ding', {});
      let ring  = dbMock.define('ring', {});
      let rang  = dbMock.define('rang', {});
      let dang  = dbMock.define('dang', {});
      let toot  = dbMock.define('toot', {});

      foo.belongsTo(modelStub);
      bingo.belongsTo(foo);
      bongo.belongsTo(foo);
      ding.belongsTo(bongo);
      ring.belongsTo(ding);
      rang.belongsTo(ding);
      dang.belongsTo(bongo);
      bar.belongsTo(modelStub);
      toot.belongsTo(bar);

      let request = new GetListRequest(req, modelStub);
      let actual = request.include;
      let expected = {
        foo: {
          bingo: {},
          bongo: {
            ding: {
              ring: {},
              rang: {}
            },
            dang: {}
          }
        },
        bar: {
          toot: {}
        }
      };

      actual.should.be.eql(expected);
    });
  });

  describe('#validate()', () => {
    // Build model stubs
    let fooModelStub     = dbMock.define('foo', {});
    let barModelStub     = dbMock.define('bar', {});
    let bazModelStub     = dbMock.define('baz', {});
    let bizBangModelStub = dbMock.define('bizBang', {});

    // Relate model stubs
    fooModelStub.hasMany(barModelStub, {as: 'bars'});
    barModelStub.belongsTo(fooModelStub);
    barModelStub.belongsTo(bazModelStub);
    bazModelStub.hasMany(bizBangModelStub);

    // Stub associations data structure to maintain compatibility with the
    // internal API of Sequelize models
    barModelStub.associations = {
      baz: {
        target: bazModelStub
      }
    };
    bazModelStub.associations = {
      'biz-bangs': {
        target: bizBangModelStub
      }
    };
    bizBangModelStub.associations = {};
    fooModelStub.associations = {
      bars: {
        target: barModelStub
      }
    };

    it('should parse include param', (done) => {
      let params = {
        query: {
          include: 'bars,bars.baz,bars.baz.biz-bangs'
        }
      };

      let expected = {
        include: [{
          model: barModelStub,
          include: [{
            model: bazModelStub,
            include: [{
              model: bizBangModelStub
            }]
          }]
        }]
      };

      let req = httpMocks.createRequest(params);

      let request = new GetListRequest(req, fooModelStub);

      request.validate().then((sequelizeQueryParams: any) => {
        sequelizeQueryParams.include.should.be.eql(expected.include);

        done();
      });
    });

    it('should parse include param when param is empty', (done) => {
      let params = {
        query: {}
      };

      let expected = {
        include: []
      };

      let req = httpMocks.createRequest(params);

      let request = new GetListRequest(req, fooModelStub);

      request.validate().then((sequelizeQueryParams: any) => {
        sequelizeQueryParams.include.should.be.eql(expected.include);

        done();
      });
    });

    it('should create errors when include param contains invalid models', (done) => {
      let params = {
        query: {
          include: 'bars,bars.baz,bars.baz.boing,bang,bing.bong'
        }
      };

      let req = httpMocks.createRequest(params);

      let request = new GetListRequest(req, fooModelStub);

      request.validate().catch(errors => {
        errors.length.should.be.eql(3);

        let errorsString = JSON.stringify(errors);

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
      let req = httpMocks.createRequest({
        query: {
          page: {
            number: 10,
            offset: 10
          }
        }
      });

      let modelStub = dbMock.define('stub', {});

      let request = new GetListRequest(req, modelStub);

      request.validate().catch(errors => {
        errors.length.should.be.eql(1);

        JSON.stringify(errors).should.have
          .string('Use of \\"page[number]\\" and \\"page[offset]\\" as pagination params are mutually exclusive.');

        done();
      });
    });

    it('should create errors when mutually exclusive "page[limit]" and "page[size]" params are set', (done) => {
      let req = httpMocks.createRequest({
        query: {
          page: {
            limit: 10,
            size: 10
          }
        }
      });

      let modelStub = dbMock.define('stub', {});

      let request = new GetListRequest(req, modelStub);

      request.validate().catch(errors => {
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
      'number'
    ].forEach(param => {
      it(`should create errors when "page[${param}]" is not numeric`, (done) => {
        let requestParams = {
          query: {
            page: {}
          }
        };

        requestParams.query.page[param] = "this is not numeric";

        let req = httpMocks.createRequest(requestParams);

        let modelStub = dbMock.define('stub', {});

        let request = new GetListRequest(req, modelStub);

        request.validate().catch(errors => {
          errors.length.should.be.eql(1);

          JSON.stringify(errors).should.have
            .string(`Invalid pagination param \\"page[${param}]\\" (\\"this is not numeric\\"). \\"page[${param}]\\" must be a number.`);

          done();
        });
      });
    });

    [
      ['offset', 0],
      ['limit', 0],
      ['size', 0],
      ['number', 1],
    ].forEach(testCase => {
      let [param, minimum] = testCase;

      it(`should create errors when "page[${param}]" is less than ${minimum}`, (done) => {
        let requestParams = {
          query: {
            page: {}
          }
        };

        requestParams.query.page[param] = -1;

        let req = httpMocks.createRequest(requestParams);

        let modelStub = dbMock.define('stub', {});

        let request = new GetListRequest(req, modelStub);

        request.validate().catch(errors => {
          errors.length.should.be.eql(1);

          JSON.stringify(errors).should.have
            .string(`Invalid pagination param \\"page[${param}]\\" (\\"-1\\"). \\"page[${param}]\\" must not be a number lower than ${minimum}`);

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
    ].forEach(testCase => {
      let [page, expectedOffset, expectedLimit] = testCase;

      it(`should parse valid pagination params ${JSON.stringify(page)}`, (done) => {
        let requestParams = {
          query: {
            page: page
          }
        };

        let req = httpMocks.createRequest(requestParams);

        let modelStub = dbMock.define('stub', {});

        let request = new GetListRequest(req, modelStub);

        request.validate().then((sequelizeQueryParams: any) => {
          sequelizeQueryParams.offset.should.be.eql(expectedOffset);
          sequelizeQueryParams.limit.should.be.eql(expectedLimit);

          done();
        });
      });
    });
  });
});
