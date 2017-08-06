// Type definitions for sequelize 3.30.4
// Project: jsonapi
// Definitions by: Tim Rourke <https://github.com/timrourke>

/*~ On this line, import the module which this module adds to */
import * as m from 'sequelize';

/*~ Here, declare the same module as the one you imported above */
declare module 'sequelize' {
  export interface Model<TInstance, TAttributes> {
    getType(): string;
    name: string;
  }

  export interface Instance<TInstance, TAttributes> {
    attributes: Array<string>;    
    getType(): string;
  }
}
