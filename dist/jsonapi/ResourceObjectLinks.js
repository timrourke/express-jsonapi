'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const StringUtils = require('./../utils/String');
const config_1 = require("./../config/config");
class ResourceObjectLinks {
    /**
     * Constructor.
     *
     * @param modelInstance {Sequelize.Instance}
     */
    constructor(modelInstance) {
        this.modelInstance = modelInstance;
        let baseUrl = config_1.default.getApiBaseUrl();
        let modelId = this.modelInstance.id;
        let modelName = this.modelInstance.getType();
        let modelRoute = StringUtils.convertCamelToDasherized(modelName);
        this.links = {
            self: `${baseUrl}/${modelRoute}/${modelId}`
        };
    }
    /**
     * Serialize the links object
     *
     * @return {Object}
     */
    toJSON() {
        return this.links;
    }
}
exports.default = ResourceObjectLinks;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzb25hcGkvUmVzb3VyY2VPYmplY3RMaW5rcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDakQsK0NBQXdDO0FBT3hDO0lBZ0JFOzs7O09BSUc7SUFDSCxZQUFZLGFBQWE7UUFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFFbkMsSUFBSSxPQUFPLEdBQUcsZ0JBQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNyQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztRQUNwQyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzdDLElBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVqRSxJQUFJLENBQUMsS0FBSyxHQUFHO1lBQ1gsSUFBSSxFQUFFLEdBQUcsT0FBTyxJQUFJLFVBQVUsSUFBSSxPQUFPLEVBQUU7U0FDNUMsQ0FBQztJQUNKLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsTUFBTTtRQUNKLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3BCLENBQUM7Q0FDRjtBQTFDRCxzQ0EwQ0MiLCJmaWxlIjoianNvbmFwaS9SZXNvdXJjZU9iamVjdExpbmtzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBTdHJpbmdVdGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvU3RyaW5nJyk7XG5pbXBvcnQgY29uZmlnIGZyb20gJy4vLi4vY29uZmlnL2NvbmZpZyc7XG5pbXBvcnQgeyBJbnN0YW5jZSB9IGZyb20gJ3NlcXVlbGl6ZSc7XG5cbmludGVyZmFjZSBMaW5rc0ludGVyZmFjZSB7XG4gIHNlbGY6IHN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzb3VyY2VPYmplY3RMaW5rcyB7XG5cbiAgLyoqXG4gICAqIEpTT04gQVBJIGxpbmtzIG9iamVjdCBmb3IgdGhpcyBSZXNvdXJjZSBPYmplY3RcbiAgICogXG4gICAqIEBzZWUgaHR0cDovL2pzb25hcGkub3JnL2Zvcm1hdC8jZG9jdW1lbnQtbGlua3NcbiAgICovXG4gIGxpbmtzOiBMaW5rc0ludGVyZmFjZTtcblxuICAvKipcbiAgICogU2VxdWVsaXplIG1vZGVsIGluc3RhbmNlIHRvIGJ1aWxkIGxpbmtzIGZvclxuICAgKiBcbiAgICogQHZhciB7U2VxdWVsaXplLkluc3RhbmNlfVxuICAgKi9cbiAgbW9kZWxJbnN0YW5jZTogSW5zdGFuY2U8YW55LCBhbnk+O1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQHBhcmFtIG1vZGVsSW5zdGFuY2Uge1NlcXVlbGl6ZS5JbnN0YW5jZX1cbiAgICovXG4gIGNvbnN0cnVjdG9yKG1vZGVsSW5zdGFuY2UpIHtcbiAgICB0aGlzLm1vZGVsSW5zdGFuY2UgPSBtb2RlbEluc3RhbmNlO1xuXG4gICAgbGV0IGJhc2VVcmwgPSBjb25maWcuZ2V0QXBpQmFzZVVybCgpO1xuICAgIGxldCBtb2RlbElkID0gdGhpcy5tb2RlbEluc3RhbmNlLmlkO1xuICAgIGxldCBtb2RlbE5hbWUgPSB0aGlzLm1vZGVsSW5zdGFuY2UuZ2V0VHlwZSgpO1xuICAgIGxldCBtb2RlbFJvdXRlID0gU3RyaW5nVXRpbHMuY29udmVydENhbWVsVG9EYXNoZXJpemVkKG1vZGVsTmFtZSk7XG5cbiAgICB0aGlzLmxpbmtzID0ge1xuICAgICAgc2VsZjogYCR7YmFzZVVybH0vJHttb2RlbFJvdXRlfS8ke21vZGVsSWR9YFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogU2VyaWFsaXplIHRoZSBsaW5rcyBvYmplY3RcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cbiAgdG9KU09OKCkge1xuICAgIHJldHVybiB0aGlzLmxpbmtzO1xuICB9XG59Il19
