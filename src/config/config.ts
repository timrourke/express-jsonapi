'use strict';

import env, { EnvConfig } from './env';

class Config {
  apiBaseUrl: string;

  baseUrl: string;

  environment: EnvConfig;

  /**
   * Constructor.
   *
   * @class Config
   * @constructor
   */
  constructor() {
    this.environment = env[process.env.NODE_ENV];
  }

  /**
   * Get the base URL as configured for the environment
   *
   * @return {String}
   */
  getBaseUrl(): string {
    if (!this.hasOwnProperty('baseUrl')) {
      this.baseUrl = this.environment.host;
    }

    return this.baseUrl;
  }

  /**
   * Get the base URL for the API as configured for the environment
   *
   * @return {String}
   */
  getApiBaseUrl(): string {
    if (!this.hasOwnProperty('apiBaseUrl')) {
      let apiBase = this.environment.apiBase;

      this.apiBaseUrl = `${this.getBaseUrl()}${apiBase}`;
    }

    return this.apiBaseUrl;
  }
}

const config = new Config();

export default config;
