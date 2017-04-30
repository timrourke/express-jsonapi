'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const StringUtils = require('./../utils/String');
const RelationshipLink_1 = require("./RelationshipLink");
/**
 * Matches an attribute's key name for being a foreign key. If the key appears
 * to be a foreign key, the matching JSON API type string is returned. Otherwise
 * returns false.
 *
 * @param {String}
 * @return {String|Boolean}
 */
function foreignKey(attrKeyName) {
    let match = attrKeyName.match(/([\w-]+)-id/);
    return (match && match[1]) || false;
}
class ResourceObject {
    /**
     * Constructor.
     *
     * @param modelInstance {Sequelize.Instance}
     */
    constructor(modelInstance) {
        this.modelInstance = modelInstance;
    }
    /**
     * Serialize the model instance's attributes, excluding the model's ID.
     *
     * @param {Array} attributes
     * @return {Object}
     */
    serializeAttributes(attributes) {
        let serializedAttributes = {};
        let instance = this.modelInstance;
        let originalAttrs = instance.attributes.filter(attr => attr !== 'id');
        attributes
            .map(attr => StringUtils.convertCamelToDasherized(attr))
            .filter(attr => {
            return (attr !== 'id') && !foreignKey(attr);
        })
            .forEach((newKeyName, index) => {
            let originalKeyName = originalAttrs[index];
            let value = instance.get(originalKeyName);
            serializedAttributes[newKeyName] = value;
        });
        return serializedAttributes;
    }
    /**
     * Serialize the model's relationships
     *
     * @param {Object} json The object to serialize as JSON
     */
    serializeRelationships(json) {
        let relationships = Object.keys(this.modelInstance.Model.associations);
        let id = String(this.modelInstance.id);
        let originalAttrs = this.modelInstance.attributes;
        let foreignKeys = originalAttrs
            .map(attr => StringUtils.convertCamelToDasherized(attr))
            .map(attr => foreignKey(attr));
        if (!relationships.length) {
            return;
        }
        json.relationships = {};
        relationships.forEach(rel => {
            json.relationships[rel] = {
                links: new RelationshipLink_1.default(this.modelInstance.getType(), id, rel)
            };
            if (foreignKeys.indexOf(rel) !== -1) {
                let index = foreignKeys.indexOf(rel);
                json.relationships[rel].data = {
                    type: this.modelInstance.Model.associations[rel].target.getType(),
                    id: String(this.modelInstance.get(originalAttrs[index]))
                };
            }
        });
    }
    /**
     * Serialize this model instance to JSON API-compliant POJO
     *
     * @return {Object}
     */
    toJSON() {
        let model = this.modelInstance.Model;
        let id = String(this.modelInstance.id);
        let json = {
            type: model.getType(),
            id: id,
            attributes: this.serializeAttributes(this.modelInstance.attributes),
        };
        if (model.hasOwnProperty('associations')) {
            this.serializeRelationships(json);
        }
        return json;
    }
}
module.exports = ResourceObject;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzb25hcGkvUmVzb3VyY2VPYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ2pELHlEQUFtRjtBQUduRjs7Ozs7OztHQU9HO0FBQ0gsb0JBQW9CLFdBQVc7SUFDN0IsSUFBSSxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUU3QyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDO0FBQ3RDLENBQUM7QUFFRDtJQVNFOzs7O09BSUc7SUFDSCxZQUFZLGFBQWE7UUFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7SUFDckMsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsbUJBQW1CLENBQUMsVUFBVTtRQUM1QixJQUFJLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztRQUM5QixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQ2xDLElBQUksYUFBYSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7UUFFdEUsVUFBVTthQUNQLEdBQUcsQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3ZELE1BQU0sQ0FBQyxJQUFJO1lBQ1YsTUFBTSxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQzthQUNELE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxLQUFLO1lBQ3pCLElBQUksZUFBZSxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzQyxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBRTFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQztRQUVMLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztJQUM5QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILHNCQUFzQixDQUFDLElBQUk7UUFDekIsSUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN2RSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QyxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQztRQUNsRCxJQUFJLFdBQVcsR0FBRyxhQUFhO2FBQzVCLEdBQUcsQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3ZELEdBQUcsQ0FBQyxJQUFJLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFakMsRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLENBQUM7UUFDVCxDQUFDO1FBRUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFFeEIsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHO1lBQ3ZCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUc7Z0JBQ3hCLEtBQUssRUFBRSxJQUFJLDBCQUFnQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQzthQUNuRSxDQUFDO1lBRUYsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLElBQUksS0FBSyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHO29CQUM3QixJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7b0JBQ2pFLEVBQUUsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7aUJBQ3pELENBQUM7WUFDSixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE1BQU07UUFDSixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztRQUVyQyxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUV2QyxJQUFJLElBQUksR0FBRztZQUNULElBQUksRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQ3JCLEVBQUUsRUFBRSxFQUFFO1lBQ04sVUFBVSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQztTQUNwRSxDQUFDO1FBRUYsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUVGO0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUMiLCJmaWxlIjoianNvbmFwaS9SZXNvdXJjZU9iamVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuY29uc3QgU3RyaW5nVXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzL1N0cmluZycpO1xuaW1wb3J0IFJlbGF0aW9uc2hpcExpbmssIHsgUmVsYXRpb25zaGlwTGlua0NvbnN0cnVjdG9yIH0gZnJvbSAnLi9SZWxhdGlvbnNoaXBMaW5rJztcbmltcG9ydCB7IEluc3RhbmNlIH0gZnJvbSAnc2VxdWVsaXplJztcblxuLyoqXG4gKiBNYXRjaGVzIGFuIGF0dHJpYnV0ZSdzIGtleSBuYW1lIGZvciBiZWluZyBhIGZvcmVpZ24ga2V5LiBJZiB0aGUga2V5IGFwcGVhcnNcbiAqIHRvIGJlIGEgZm9yZWlnbiBrZXksIHRoZSBtYXRjaGluZyBKU09OIEFQSSB0eXBlIHN0cmluZyBpcyByZXR1cm5lZC4gT3RoZXJ3aXNlXG4gKiByZXR1cm5zIGZhbHNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfVxuICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGZvcmVpZ25LZXkoYXR0cktleU5hbWUpIHtcbiAgbGV0IG1hdGNoID0gYXR0cktleU5hbWUubWF0Y2goLyhbXFx3LV0rKS1pZC8pO1xuXG4gIHJldHVybiAobWF0Y2ggJiYgbWF0Y2hbMV0pIHx8IGZhbHNlO1xufVxuXG5jbGFzcyBSZXNvdXJjZU9iamVjdCB7XG5cbiAgLyoqXG4gICAqIFNlcXVlbGl6ZSBtb2RlbCBpbnN0YW5jZSBmb3IgdGhpcyBSZXNvdXJjZSBPYmplY3RcbiAgICogXG4gICAqIEB2YXIge1NlcXVlbGl6ZS5JbnN0YW5jZX1cbiAgICovXG4gIG1vZGVsSW5zdGFuY2U6IEluc3RhbmNlPGFueSwgYW55PjtcblxuICAvKipcbiAgICogQ29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSBtb2RlbEluc3RhbmNlIHtTZXF1ZWxpemUuSW5zdGFuY2V9XG4gICAqL1xuICBjb25zdHJ1Y3Rvcihtb2RlbEluc3RhbmNlKSB7XG4gICAgdGhpcy5tb2RlbEluc3RhbmNlID0gbW9kZWxJbnN0YW5jZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXJpYWxpemUgdGhlIG1vZGVsIGluc3RhbmNlJ3MgYXR0cmlidXRlcywgZXhjbHVkaW5nIHRoZSBtb2RlbCdzIElELlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5fSBhdHRyaWJ1dGVzXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG4gIHNlcmlhbGl6ZUF0dHJpYnV0ZXMoYXR0cmlidXRlcykge1xuICAgIGxldCBzZXJpYWxpemVkQXR0cmlidXRlcyA9IHt9O1xuICAgIGxldCBpbnN0YW5jZSA9IHRoaXMubW9kZWxJbnN0YW5jZTtcbiAgICBsZXQgb3JpZ2luYWxBdHRycyA9IGluc3RhbmNlLmF0dHJpYnV0ZXMuZmlsdGVyKGF0dHIgPT4gYXR0ciAhPT0gJ2lkJyk7XG5cbiAgICBhdHRyaWJ1dGVzXG4gICAgICAubWFwKGF0dHIgPT4gU3RyaW5nVXRpbHMuY29udmVydENhbWVsVG9EYXNoZXJpemVkKGF0dHIpKVxuICAgICAgLmZpbHRlcihhdHRyID0+IHtcbiAgICAgICAgcmV0dXJuIChhdHRyICE9PSAnaWQnKSAmJiAhZm9yZWlnbktleShhdHRyKTtcbiAgICAgIH0pXG4gICAgICAuZm9yRWFjaCgobmV3S2V5TmFtZSwgaW5kZXgpID0+IHtcbiAgICAgICAgbGV0IG9yaWdpbmFsS2V5TmFtZSA9IG9yaWdpbmFsQXR0cnNbaW5kZXhdO1xuICAgICAgICBsZXQgdmFsdWUgPSBpbnN0YW5jZS5nZXQob3JpZ2luYWxLZXlOYW1lKTtcblxuICAgICAgICBzZXJpYWxpemVkQXR0cmlidXRlc1tuZXdLZXlOYW1lXSA9IHZhbHVlO1xuICAgICAgfSk7XG5cbiAgICByZXR1cm4gc2VyaWFsaXplZEF0dHJpYnV0ZXM7XG4gIH1cblxuICAvKipcbiAgICogU2VyaWFsaXplIHRoZSBtb2RlbCdzIHJlbGF0aW9uc2hpcHNcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGpzb24gVGhlIG9iamVjdCB0byBzZXJpYWxpemUgYXMgSlNPTlxuICAgKi9cbiAgc2VyaWFsaXplUmVsYXRpb25zaGlwcyhqc29uKSB7XG4gICAgbGV0IHJlbGF0aW9uc2hpcHMgPSBPYmplY3Qua2V5cyh0aGlzLm1vZGVsSW5zdGFuY2UuTW9kZWwuYXNzb2NpYXRpb25zKTtcbiAgICBsZXQgaWQgPSBTdHJpbmcodGhpcy5tb2RlbEluc3RhbmNlLmlkKTtcbiAgICBsZXQgb3JpZ2luYWxBdHRycyA9IHRoaXMubW9kZWxJbnN0YW5jZS5hdHRyaWJ1dGVzO1xuICAgIGxldCBmb3JlaWduS2V5cyA9IG9yaWdpbmFsQXR0cnNcbiAgICAgIC5tYXAoYXR0ciA9PiBTdHJpbmdVdGlscy5jb252ZXJ0Q2FtZWxUb0Rhc2hlcml6ZWQoYXR0cikpXG4gICAgICAubWFwKGF0dHIgPT4gZm9yZWlnbktleShhdHRyKSk7XG5cbiAgICBpZiAoIXJlbGF0aW9uc2hpcHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAganNvbi5yZWxhdGlvbnNoaXBzID0ge307XG5cbiAgICByZWxhdGlvbnNoaXBzLmZvckVhY2gocmVsID0+IHtcbiAgICAgIGpzb24ucmVsYXRpb25zaGlwc1tyZWxdID0ge1xuICAgICAgICBsaW5rczogbmV3IFJlbGF0aW9uc2hpcExpbmsodGhpcy5tb2RlbEluc3RhbmNlLmdldFR5cGUoKSwgaWQsIHJlbClcbiAgICAgIH07XG5cbiAgICAgIGlmIChmb3JlaWduS2V5cy5pbmRleE9mKHJlbCkgIT09IC0xKSB7XG4gICAgICAgIGxldCBpbmRleCA9IGZvcmVpZ25LZXlzLmluZGV4T2YocmVsKTtcbiAgICAgICAganNvbi5yZWxhdGlvbnNoaXBzW3JlbF0uZGF0YSA9IHtcbiAgICAgICAgICB0eXBlOiB0aGlzLm1vZGVsSW5zdGFuY2UuTW9kZWwuYXNzb2NpYXRpb25zW3JlbF0udGFyZ2V0LmdldFR5cGUoKSxcbiAgICAgICAgICBpZDogU3RyaW5nKHRoaXMubW9kZWxJbnN0YW5jZS5nZXQob3JpZ2luYWxBdHRyc1tpbmRleF0pKVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlcmlhbGl6ZSB0aGlzIG1vZGVsIGluc3RhbmNlIHRvIEpTT04gQVBJLWNvbXBsaWFudCBQT0pPXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG4gIHRvSlNPTigpIHtcbiAgICBsZXQgbW9kZWwgPSB0aGlzLm1vZGVsSW5zdGFuY2UuTW9kZWw7XG5cbiAgICBsZXQgaWQgPSBTdHJpbmcodGhpcy5tb2RlbEluc3RhbmNlLmlkKTtcblxuICAgIGxldCBqc29uID0ge1xuICAgICAgdHlwZTogbW9kZWwuZ2V0VHlwZSgpLFxuICAgICAgaWQ6IGlkLFxuICAgICAgYXR0cmlidXRlczogdGhpcy5zZXJpYWxpemVBdHRyaWJ1dGVzKHRoaXMubW9kZWxJbnN0YW5jZS5hdHRyaWJ1dGVzKSxcbiAgICB9O1xuXG4gICAgaWYgKG1vZGVsLmhhc093blByb3BlcnR5KCdhc3NvY2lhdGlvbnMnKSkge1xuICAgICAgdGhpcy5zZXJpYWxpemVSZWxhdGlvbnNoaXBzKGpzb24pO1xuICAgIH1cblxuICAgIHJldHVybiBqc29uO1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZXNvdXJjZU9iamVjdDtcbiJdfQ==
