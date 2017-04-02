process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const GetListRequest = require('./../../jsonapi/GetListRequest');

/**
 * Stub for Express.Request
 *
 * @return {Object}
 */
function RequestStub() {
  this.query= {
    include: 'foo,bar,foo.bingo,foo.bongo.ding,foo.bongo.dang,bar.toot,foo.bongo.ding.ring,foo.bongo.ding.rang'
  };
};

describe('jsonapi/GetListRequest', () => {
  describe('#constructor()', () => {
    it('should parse include param', () => {
      let request = new GetListRequest(new RequestStub());
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
});
