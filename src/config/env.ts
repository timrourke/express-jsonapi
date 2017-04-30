'use strict';

interface EnvConfig {
  host: string;
  apiBase: string;
}

module.exports = {
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
}
