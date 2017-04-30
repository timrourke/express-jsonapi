'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./../config/config");
;
class RelationshipLink {
    /**
     * Constructor.
     *
     * @param {String} modelRoute The parent model's route
     * @param {String} modelId The parent model instance's ID
     * @param {String} relationship The name of the relationship to link to
     */
    constructor(modelRoute, modelId, relationship) {
        this.modelRoute = modelRoute;
        this.modelId = modelId;
        this.relationship = relationship;
    }
    /**
     * Serialize the link object
     *
     * @return {Object}
     */
    toJSON() {
        let baseUrl = config_1.default.getApiBaseUrl();
        let link = {
            self: `${baseUrl}/${this.modelRoute}/${this.modelId}/relationships/${this.relationship}`,
            related: `${baseUrl}/${this.modelRoute}/${this.modelId}/${this.relationship}`
        };
        return link;
    }
}
exports.default = RelationshipLink;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzb25hcGkvUmVsYXRpb25zaGlwTGluay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIsK0NBQXdDO0FBS3ZDLENBQUM7QUFVRjtJQXVCRTs7Ozs7O09BTUc7SUFDSCxZQUFZLFVBQWtCLEVBQUUsT0FBZSxFQUFFLFlBQW9CO1FBQ25FLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO0lBQ25DLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsTUFBTTtRQUNKLElBQUksT0FBTyxHQUFHLGdCQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFckMsSUFBSSxJQUFJLEdBQW1CO1lBQ3pCLElBQUksRUFBRSxHQUFHLE9BQU8sSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxPQUFPLGtCQUFrQixJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ3hGLE9BQU8sRUFBRSxHQUFHLE9BQU8sSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtTQUM5RSxDQUFDO1FBRUYsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7Q0FDRjtBQW5ERCxtQ0FtREMiLCJmaWxlIjoianNvbmFwaS9SZWxhdGlvbnNoaXBMaW5rLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vLi4vY29uZmlnL2NvbmZpZyc7XG5cbmludGVyZmFjZSBMaW5rc0ludGVyZmFjZSB7XG4gIHNlbGY6IHN0cmluZztcbiAgcmVsYXRlZDogc3RyaW5nO1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBSZWxhdGlvbnNoaXBMaW5rQ29uc3RydWN0b3Ige1xuICBuZXcgKG1vZGVsUm91dGU6IHN0cmluZywgbW9kZWxJZDogc3RyaW5nLCByZWxhdGlvbnNoaXA6IHN0cmluZyk6IFJlbGF0aW9uc2hpcExpbmtJbnRlcmZhY2U7XG59XG5cbmludGVyZmFjZSBSZWxhdGlvbnNoaXBMaW5rSW50ZXJmYWNlIHtcbiAgdG9KU09OKCk6IGFueTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVsYXRpb25zaGlwTGluayBpbXBsZW1lbnRzIFJlbGF0aW9uc2hpcExpbmtJbnRlcmZhY2Uge1xuXG4gIC8qKlxuICAgKiBNb2RlbCByb3V0ZSBuYW1lIGZvciBsaW5rXG4gICAqIFxuICAgKiBAdmFyIHtTdHJpbmd9XG4gICAqL1xuICBtb2RlbFJvdXRlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIE1vZGVsIElEIGZvciBsaW5rXG4gICAqIFxuICAgKiBAdmFyIHtTdHJpbmd9XG4gICAqL1xuICBtb2RlbElkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFJlbGF0aW9uc2hpcCBuYW1lXG4gICAqIFxuICAgKiBAdmFyIHtTdHJpbmd9XG4gICAqL1xuICByZWxhdGlvbnNoaXA6IHN0cmluZztcblxuICAvKipcbiAgICogQ29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtb2RlbFJvdXRlIFRoZSBwYXJlbnQgbW9kZWwncyByb3V0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbW9kZWxJZCBUaGUgcGFyZW50IG1vZGVsIGluc3RhbmNlJ3MgSURcbiAgICogQHBhcmFtIHtTdHJpbmd9IHJlbGF0aW9uc2hpcCBUaGUgbmFtZSBvZiB0aGUgcmVsYXRpb25zaGlwIHRvIGxpbmsgdG9cbiAgICovXG4gIGNvbnN0cnVjdG9yKG1vZGVsUm91dGU6IHN0cmluZywgbW9kZWxJZDogc3RyaW5nLCByZWxhdGlvbnNoaXA6IHN0cmluZykge1xuICAgIHRoaXMubW9kZWxSb3V0ZSA9IG1vZGVsUm91dGU7XG4gICAgdGhpcy5tb2RlbElkID0gbW9kZWxJZDtcbiAgICB0aGlzLnJlbGF0aW9uc2hpcCA9IHJlbGF0aW9uc2hpcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXJpYWxpemUgdGhlIGxpbmsgb2JqZWN0XG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG4gIHRvSlNPTigpIHtcbiAgICBsZXQgYmFzZVVybCA9IGNvbmZpZy5nZXRBcGlCYXNlVXJsKCk7XG5cbiAgICBsZXQgbGluazogTGlua3NJbnRlcmZhY2UgPSB7XG4gICAgICBzZWxmOiBgJHtiYXNlVXJsfS8ke3RoaXMubW9kZWxSb3V0ZX0vJHt0aGlzLm1vZGVsSWR9L3JlbGF0aW9uc2hpcHMvJHt0aGlzLnJlbGF0aW9uc2hpcH1gLFxuICAgICAgcmVsYXRlZDogYCR7YmFzZVVybH0vJHt0aGlzLm1vZGVsUm91dGV9LyR7dGhpcy5tb2RlbElkfS8ke3RoaXMucmVsYXRpb25zaGlwfWBcbiAgICB9O1xuXG4gICAgcmV0dXJuIGxpbms7XG4gIH1cbn0iXX0=
