'use strict';

process.env.NODE_ENV = 'test';

import * as chai from 'chai';
import extractIncludedModelsAsFlatArray from './../../jsonapi/extract-included-models-as-flat-array';

chai.should();

const arrayOfModelsStub = [
  {
    id: 1,
    foos: [
      {
        id: 2,
        bar: {
          id: 5,
          Model: {
            associations: {},
          },
        },
        foos: [
          {
            id: 7,
            baz: {
              id: 8,
              Model: {
                associations: {},
              },
            },
            Model: {
              associations: {
                baz: {},
              },
            },
          }
        ],
        Model: {
          associations: {
            foos: {},
            bar: {}
          }
        }
      }
    ],
    Model: {
      associations: {
        foos: {},
        bar: {}
      }
    }
  },
  {
    id: 3,
    bar: {
      id: 4,
      Model: {
        associations: {

        }
      }
    },
    Model: {
      associations: {
        bar: {}
      }
    }
  }
];

describe('jsonapi/extract-included-models-as-flat-array', () => {
  it('should extract included models from an array of models', () => {
    let flatArray = [];

    extractIncludedModelsAsFlatArray(arrayOfModelsStub, flatArray);

    let actual = flatArray.map(o => o.id).sort();

    actual.length.should.be.eql(5);
    actual.should.be.eql([2,4,5,7,8]);
  });
});
