'use strict';

process.env.NODE_ENV = 'test';

import chai = require('chai');
const should = chai.should();
import Utils from './../../utils/String';

const dasherizedTestCases = [
  ['moneyMakingMonkeys', 'money-making-monkeys'],
  ['anUnusualItem', 'an-unusual-item'],
  ['hats-off-to-you-sir', 'hats-off-to-you-sir'],
  ['piano', 'piano'],
  ['Marvelous', 'marvelous'],
];

const camelCasedTestCases = [
  ['silly-sally-sold-sandwiches', 'sillySallySoldSandwiches'],
  ['sports', 'sports'],
  ['the-radio-is-on', 'theRadioIsOn'],
  ['whyHelloThere', 'whyHelloThere'],
  ['yes-sir', 'yesSir'],
];

describe('jsonapi/Utils', () => {
  describe('#convertCamelToDasherized()', () => {
    it('should convert camel-cased strings into dasherized strings', () => {
      dasherizedTestCases.forEach((testCase) => {
        const [input, expected] = testCase;
        const actual = Utils.convertCamelToDasherized(input);

        actual.should.be.eql(expected);
      });
    });
  });

  describe('#convertDasherizedToCamelCase()', () => {
    it('should convert dasherized strings into camel-cased strings', () => {
      camelCasedTestCases.forEach((testCase) => {
        const [input, expected] = testCase;
        const actual = Utils.convertDasherizedToCamelCase(input);

        actual.should.be.eql(expected);
      });
    });
  });
});
