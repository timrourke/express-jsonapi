'use strict';

import env, { IEnvConfig } from './env';

class Config {
  /**
   * The base of the API's URL
   *
   * @property apiBaseUrl
   * @type {String}
   */
  private apiBaseUrl: string;

  /**
   * The base URL of the application
   *
   * @property baseUrl
   * @type {String}
   */
  private baseUrl: string;

  /**
   * The application config derived from the environment
   *
   * @property environment
   * @type {IEnvConfig}
   */
  private environment: IEnvConfig;

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
  public getBaseUrl(): string {
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
  public getApiBaseUrl(): string {
    if (!this.hasOwnProperty('apiBaseUrl')) {
      const apiBase = this.environment.apiBase;

      this.apiBaseUrl = `${this.getBaseUrl()}${apiBase}`;
    }

    return this.apiBaseUrl;
  }
}

const config = new Config();

export default config;
