'use strict';

export interface EnvConfig {
  host: string;
  apiBase: string;
}

export default {
  "development": {
    "host": "http://localhost:3000",
    "apiBase": "/api"
  },
  "test": {
    "host": "http://localhost:3000",
    "apiBase": "/api"
  },
  "production": {
    "host": "http://localhost:3000",
    "apiBase": "/api"
  }
};