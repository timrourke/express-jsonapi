'use strict';

process.env.NODE_ENV = 'test';

import * as chai from 'chai';
import extractIncludedModelsAsFlatArray from './../../jsonapi/extract-included-models-as-flat-array';

chai.should();

const arrayOfModelsStub = [
  {
    Model: {
      associations: {
        bar: {},
        foos: {},
      },
    },
    foos: [
      {
        Model: {
          associations: {
            bar: {},
            foos: {},
          },
        },
        bar: {
          Model: {
            associations: {},
          },
          id: 5,
        },
        foos: [
          {
            Model: {
              associations: {
                baz: {},
              },
            },
            baz: {
              Model: {
                associations: {},
              },
              id: 8,
            },
            id: 7,
          },
        ],
        id: 2,
      },
    ],
    id: 1,
  },
  {
    Model: {
      associations: {
        bar: {},
      },
    },
    bar: {
      Model: {
        associations: {

        },
      },
      id: 4,
    },
    id: 3,
  },
];

describe('jsonapi/extract-included-models-as-flat-array', () => {
  it('should extract included models from an array of models', () => {
    const flatArray = [];

    extractIncludedModelsAsFlatArray(arrayOfModelsStub, flatArray);

    const actual = flatArray.map((o) => o.id).sort();

    actual.length.should.be.eql(5);
    actual.should.be.eql([2, 4, 5, 7, 8]);
  });
});
