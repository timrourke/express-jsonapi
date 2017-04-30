'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const env = require('./env.js');
class Config {
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
    getBaseUrl() {
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
    getApiBaseUrl() {
        if (!this.hasOwnProperty('apiBaseUrl')) {
            let apiBase = this.environment.apiBase;
            this.apiBaseUrl = `${this.getBaseUrl()}${apiBase}`;
        }
        return this.apiBaseUrl;
    }
}
const config = new Config();
exports.default = config;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbmZpZy9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUVoQztJQU9FOzs7OztPQUtHO0lBQ0g7UUFDRSxJQUFJLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsVUFBVTtRQUNSLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztRQUN2QyxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxhQUFhO1FBQ1gsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztZQUV2QyxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLE9BQU8sRUFBRSxDQUFDO1FBQ3JELENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN6QixDQUFDO0NBQ0Y7QUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO0FBRTVCLGtCQUFlLE1BQU0sQ0FBQyIsImZpbGUiOiJjb25maWcvY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBlbnYgPSByZXF1aXJlKCcuL2Vudi5qcycpO1xuXG5jbGFzcyBDb25maWcge1xuICBhcGlCYXNlVXJsOiBzdHJpbmc7XG5cbiAgYmFzZVVybDogc3RyaW5nO1xuXG4gIGVudmlyb25tZW50OiBFbnZDb25maWc7XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAY2xhc3MgQ29uZmlnXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5lbnZpcm9ubWVudCA9IGVudltwcm9jZXNzLmVudi5OT0RFX0VOVl07XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBiYXNlIFVSTCBhcyBjb25maWd1cmVkIGZvciB0aGUgZW52aXJvbm1lbnRcbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cbiAgZ2V0QmFzZVVybCgpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5oYXNPd25Qcm9wZXJ0eSgnYmFzZVVybCcpKSB7XG4gICAgICB0aGlzLmJhc2VVcmwgPSB0aGlzLmVudmlyb25tZW50Lmhvc3Q7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuYmFzZVVybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGJhc2UgVVJMIGZvciB0aGUgQVBJIGFzIGNvbmZpZ3VyZWQgZm9yIHRoZSBlbnZpcm9ubWVudFxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuICBnZXRBcGlCYXNlVXJsKCk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLmhhc093blByb3BlcnR5KCdhcGlCYXNlVXJsJykpIHtcbiAgICAgIGxldCBhcGlCYXNlID0gdGhpcy5lbnZpcm9ubWVudC5hcGlCYXNlO1xuXG4gICAgICB0aGlzLmFwaUJhc2VVcmwgPSBgJHt0aGlzLmdldEJhc2VVcmwoKX0ke2FwaUJhc2V9YDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5hcGlCYXNlVXJsO1xuICB9XG59XG5cbmNvbnN0IGNvbmZpZyA9IG5ldyBDb25maWcoKTtcblxuZXhwb3J0IGRlZmF1bHQgY29uZmlnO1xuIl19
