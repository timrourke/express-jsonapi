'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require('sequelize');
const UnprocessableEntity_1 = require("./UnprocessableEntity");
const StringUtils = require('./../../utils/String');
const titleize = require('inflection').titleize;
const underscore = require('inflection').underscore;
/**
 * Build an error object for a validation error.
 *
 * @param {Sequelize.ValidationErrorItem} sequelizeErrorItem The error item returned by Sequelize
 * @param {String} modelName Name of the model the error was thrown for
 * @return {UnprocessableEntity}
 */
function buildValidationError(sequelizeErrorItem, modelName) {
    let modelTitle = titleize(underscore(modelName));
    let attr = StringUtils.convertCamelToDasherized(sequelizeErrorItem.path);
    let msg = '';
    switch (sequelizeErrorItem.type) {
        case 'unique violation':
            msg = `${modelTitle}'s ${attr.replace(/-/g, ' ')} must be unique. "${sequelizeErrorItem.value}" was already chosen.`;
            break;
        case 'notNull Violation':
            msg = `${modelTitle}'s ${attr.replace(/-/g, ' ')} is required.`;
            break;
        default:
            msg = sequelizeErrorItem.message;
            break;
    }
    let error = new UnprocessableEntity_1.default(msg);
    error.setPointer(`/data/attributes/${attr}`);
    error.setTitle('Invalid Attribute');
    return error;
}
/**
 * Try to extract meaningful error objects out of a Sequelize error
 *
 * @param {mixed} err Error thrown by Sequelize
 * @param {Sequelize.Model} model Model the error was thrown for
 * @return {Promise}
 */
function tryHandlingCrudError(err, model) {
    return new Promise((resolve, reject) => {
        if (!(err instanceof Sequelize.Error)) {
            return reject(err);
        }
        if (err instanceof Sequelize.ValidationError) {
            let errors = err.errors.map(sequelizeErrorItem => {
                return buildValidationError(sequelizeErrorItem, model.name);
            });
            return resolve({
                status: 422,
                json: {
                    errors: errors
                }
            });
        }
        return reject(err);
    });
}
module.exports = tryHandlingCrudError;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzb25hcGkvZXJyb3JzL3RyeUhhbmRsaW5nQ3J1ZEVycm9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdkMsK0RBQXdEO0FBQ3hELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ3BELE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDaEQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLFVBQVUsQ0FBQztBQUVwRDs7Ozs7O0dBTUc7QUFDSCw4QkFBOEIsa0JBQWtCLEVBQUUsU0FBUztJQUN6RCxJQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDakQsSUFBSSxJQUFJLEdBQUcsV0FBVyxDQUFDLHdCQUF3QixDQUM3QyxrQkFBa0IsQ0FBQyxJQUFJLENBQ3hCLENBQUM7SUFDRixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFFYixNQUFNLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLEtBQUssa0JBQWtCO1lBQ3JCLEdBQUcsR0FBRyxHQUFHLFVBQVUsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMscUJBQXFCLGtCQUFrQixDQUFDLEtBQUssdUJBQXVCLENBQUM7WUFDckgsS0FBSyxDQUFDO1FBQ1IsS0FBSyxtQkFBbUI7WUFDdEIsR0FBRyxHQUFHLEdBQUcsVUFBVSxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDaEUsS0FBSyxDQUFDO1FBQ1I7WUFDRSxHQUFHLEdBQUcsa0JBQWtCLENBQUMsT0FBTyxDQUFDO1lBQ2pDLEtBQUssQ0FBQztJQUNWLENBQUM7SUFFRCxJQUFJLEtBQUssR0FBRyxJQUFJLDZCQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRXpDLEtBQUssQ0FBQyxVQUFVLENBQUMsb0JBQW9CLElBQUksRUFBRSxDQUFDLENBQUM7SUFDN0MsS0FBSyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBRXBDLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDZixDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsOEJBQThCLEdBQUcsRUFBRSxLQUFLO0lBQ3RDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNO1FBQ2pDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFlBQVksU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxHQUFHLFlBQVksU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDN0MsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsa0JBQWtCO2dCQUM1QyxNQUFNLENBQUMsb0JBQW9CLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlELENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLE9BQU8sQ0FBQztnQkFDYixNQUFNLEVBQUUsR0FBRztnQkFDWCxJQUFJLEVBQUU7b0JBQ0osTUFBTSxFQUFFLE1BQU07aUJBQ2Y7YUFDRixDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyQixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLG9CQUFvQixDQUFDIiwiZmlsZSI6Impzb25hcGkvZXJyb3JzL3RyeUhhbmRsaW5nQ3J1ZEVycm9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBTZXF1ZWxpemUgPSByZXF1aXJlKCdzZXF1ZWxpemUnKTtcbmltcG9ydCBVbnByb2Nlc3NhYmxlRW50aXR5IGZyb20gJy4vVW5wcm9jZXNzYWJsZUVudGl0eSc7XG5jb25zdCBTdHJpbmdVdGlscyA9IHJlcXVpcmUoJy4vLi4vLi4vdXRpbHMvU3RyaW5nJyk7XG5jb25zdCB0aXRsZWl6ZSA9IHJlcXVpcmUoJ2luZmxlY3Rpb24nKS50aXRsZWl6ZTtcbmNvbnN0IHVuZGVyc2NvcmUgPSByZXF1aXJlKCdpbmZsZWN0aW9uJykudW5kZXJzY29yZTtcblxuLyoqXG4gKiBCdWlsZCBhbiBlcnJvciBvYmplY3QgZm9yIGEgdmFsaWRhdGlvbiBlcnJvci5cbiAqXG4gKiBAcGFyYW0ge1NlcXVlbGl6ZS5WYWxpZGF0aW9uRXJyb3JJdGVtfSBzZXF1ZWxpemVFcnJvckl0ZW0gVGhlIGVycm9yIGl0ZW0gcmV0dXJuZWQgYnkgU2VxdWVsaXplXG4gKiBAcGFyYW0ge1N0cmluZ30gbW9kZWxOYW1lIE5hbWUgb2YgdGhlIG1vZGVsIHRoZSBlcnJvciB3YXMgdGhyb3duIGZvclxuICogQHJldHVybiB7VW5wcm9jZXNzYWJsZUVudGl0eX1cbiAqL1xuZnVuY3Rpb24gYnVpbGRWYWxpZGF0aW9uRXJyb3Ioc2VxdWVsaXplRXJyb3JJdGVtLCBtb2RlbE5hbWUpIHtcbiAgbGV0IG1vZGVsVGl0bGUgPSB0aXRsZWl6ZSh1bmRlcnNjb3JlKG1vZGVsTmFtZSkpO1xuICBsZXQgYXR0ciA9IFN0cmluZ1V0aWxzLmNvbnZlcnRDYW1lbFRvRGFzaGVyaXplZChcbiAgICBzZXF1ZWxpemVFcnJvckl0ZW0ucGF0aFxuICApO1xuICBsZXQgbXNnID0gJyc7XG5cbiAgc3dpdGNoIChzZXF1ZWxpemVFcnJvckl0ZW0udHlwZSkge1xuICAgIGNhc2UgJ3VuaXF1ZSB2aW9sYXRpb24nOlxuICAgICAgbXNnID0gYCR7bW9kZWxUaXRsZX0ncyAke2F0dHIucmVwbGFjZSgvLS9nLCAnICcpfSBtdXN0IGJlIHVuaXF1ZS4gXCIke3NlcXVlbGl6ZUVycm9ySXRlbS52YWx1ZX1cIiB3YXMgYWxyZWFkeSBjaG9zZW4uYDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ25vdE51bGwgVmlvbGF0aW9uJzpcbiAgICAgIG1zZyA9IGAke21vZGVsVGl0bGV9J3MgJHthdHRyLnJlcGxhY2UoLy0vZywgJyAnKX0gaXMgcmVxdWlyZWQuYDtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBtc2cgPSBzZXF1ZWxpemVFcnJvckl0ZW0ubWVzc2FnZTtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgbGV0IGVycm9yID0gbmV3IFVucHJvY2Vzc2FibGVFbnRpdHkobXNnKTtcblxuICBlcnJvci5zZXRQb2ludGVyKGAvZGF0YS9hdHRyaWJ1dGVzLyR7YXR0cn1gKTtcbiAgZXJyb3Iuc2V0VGl0bGUoJ0ludmFsaWQgQXR0cmlidXRlJyk7XG5cbiAgcmV0dXJuIGVycm9yO1xufVxuXG4vKipcbiAqIFRyeSB0byBleHRyYWN0IG1lYW5pbmdmdWwgZXJyb3Igb2JqZWN0cyBvdXQgb2YgYSBTZXF1ZWxpemUgZXJyb3JcbiAqXG4gKiBAcGFyYW0ge21peGVkfSBlcnIgRXJyb3IgdGhyb3duIGJ5IFNlcXVlbGl6ZVxuICogQHBhcmFtIHtTZXF1ZWxpemUuTW9kZWx9IG1vZGVsIE1vZGVsIHRoZSBlcnJvciB3YXMgdGhyb3duIGZvclxuICogQHJldHVybiB7UHJvbWlzZX1cbiAqL1xuZnVuY3Rpb24gdHJ5SGFuZGxpbmdDcnVkRXJyb3IoZXJyLCBtb2RlbCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGlmICghKGVyciBpbnN0YW5jZW9mIFNlcXVlbGl6ZS5FcnJvcikpIHtcbiAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICB9XG5cbiAgICBpZiAoZXJyIGluc3RhbmNlb2YgU2VxdWVsaXplLlZhbGlkYXRpb25FcnJvcikge1xuICAgICAgbGV0IGVycm9ycyA9IGVyci5lcnJvcnMubWFwKHNlcXVlbGl6ZUVycm9ySXRlbSA9PiB7XG4gICAgICAgIHJldHVybiBidWlsZFZhbGlkYXRpb25FcnJvcihzZXF1ZWxpemVFcnJvckl0ZW0sIG1vZGVsLm5hbWUpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByZXNvbHZlKHtcbiAgICAgICAgc3RhdHVzOiA0MjIsXG4gICAgICAgIGpzb246IHtcbiAgICAgICAgICBlcnJvcnM6IGVycm9yc1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRyeUhhbmRsaW5nQ3J1ZEVycm9yO1xuIl19
