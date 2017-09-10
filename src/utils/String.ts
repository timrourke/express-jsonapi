'use strict';

/**
 * Convert camel case string to dasherized string
 *
 * @param {String}
 * @return {String}
 */
export function convertCamelToDasherized(str: string): string {
  return str
    .split(/(?=[A-Z])/)
    .join('-')
    .toLowerCase();
}

/**
 * Convert dasherized string to camel case string
 *
 * @param {String}
 * @return {String}
 */
export function convertDasherizedToCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (match, group) => {
    return group.toUpperCase();
  });
}

export default {
  convertCamelToDasherized,
  convertDasherizedToCamelCase,
};
