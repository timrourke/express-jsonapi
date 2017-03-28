'use strict';

/**
 * Convert camel case string to dasherized string
 *
 * @param {String}
 * @return {String}
 */
function convertCamelToDasherized(string) {
  return string
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
function convertDasherizedToCamelCase(string) {
  return string.replace(/-([a-z])/g,
    (match, group) => group.toUpperCase()
  );
}

module.exports = {
  convertCamelToDasherized: convertCamelToDasherized,
  convertDasherizedToCamelCase: convertDasherizedToCamelCase
};
