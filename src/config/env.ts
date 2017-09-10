'use strict';

export interface IEnvConfig {
  host: string;
  apiBase: string;
}

export default {
  development: {
    apiBase: '/api',
    host: 'http://localhost:3000',
  },
  production: {
    apiBase: '/api',
    host: 'http://localhost:3000',
  },
  test: {
    apiBase: '/api',
    host: 'http://localhost:3000',
  },
};
