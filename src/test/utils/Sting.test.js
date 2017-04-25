process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const Utils = require('./../../utils/String');

const dasherizedTestCases = [
  ['moneyMakingMonkeys', 'money-making-monkeys'],
  ['anUnusualItem', 'an-unusual-item'],
  ['hats-off-to-you-sir', 'hats-off-to-you-sir'],
  ['piano', 'piano'],
  ['Marvelous', 'marvelous']
];

const camelCasedTestCases = [
  ['silly-sally-sold-sandwiches', 'sillySallySoldSandwiches'],
  ['sports', 'sports'],
  ['the-radio-is-on', 'theRadioIsOn'],
  ['whyHelloThere', 'whyHelloThere'],
  ['yes-sir', 'yesSir']
];

describe('jsonapi/Utils', () => {
  describe('#convertCamelToDasherized()', () => {
    it('should convert camel-cased strings into dasherized strings', () => {
      dasherizedTestCases.forEach(testCase => {
        let [input, expected] = testCase;
        let actual = Utils.convertCamelToDasherized(input);

        actual.should.be.eql(expected);
      });
    });
  });

  describe('#convertDasherizedToCamelCase()', () => {
    it('should convert dasherized strings into camel-cased strings', () => {
      camelCasedTestCases.forEach(testCase => {
        let [input, expected] = testCase;
        let actual = Utils.convertDasherizedToCamelCase(input);

        actual.should.be.eql(expected);
      });
    });
  });
});
