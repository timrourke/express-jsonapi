'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const GetListRequest = require('./../../jsonapi/GetListRequest');

chai.should();

describe('jsonapi/GetListRequest', () => {
  describe('#constructor()', () => {
    it('should parse include param', () => {
      let request = new GetListRequest({
        query: {
          include: 'foo,bar,foo.bingo,foo.bongo.ding,foo.bongo.dang,bar.toot,foo.bongo.ding.ring,foo.bongo.ding.rang'
        }
      });
      let actual = request.includes;
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
    it('should create errors when mutually exclusive "page[offset]" and "page[number]" params are set', (done) => {
      let request = new GetListRequest({
        query: {
          page: {
            number: 10,
            offset: 10
          }
        }
      });

      request.validate().catch(errors => {
        errors.length.should.be.eql(1);

        JSON.stringify(errors).should.have
          .string('Use of \\"page[number]\\" and \\"page[offset]\\" as pagination params are mutually exclusive.');

        done();
      });
    });

    it('should create errors when mutually exclusive "page[limit]" and "page[size]" params are set', (done) => {
      let request = new GetListRequest({
        query: {
          page: {
            limit: 10,
            size: 10
          }
        }
      });

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

        let request = new GetListRequest(requestParams);

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

        let request = new GetListRequest(requestParams);

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

        let request = new GetListRequest(requestParams);

        request.validate().then(sequelizeQueryParams => {
          sequelizeQueryParams.offset.should.be.eql(expectedOffset);
          sequelizeQueryParams.limit.should.be.eql(expectedLimit);

          done();
        });
      });
    });
  });
});
