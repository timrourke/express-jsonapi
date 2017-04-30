'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class NotFoundError extends Error {
    /**
     * toJSON
     *
     * @return {Object}
     */
    toJSON() {
        return {
            status: 404,
            title: 'Not Found',
            detail: this.message
        };
    }
}
exports.default = NotFoundError;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzb25hcGkvZXJyb3JzL05vdEZvdW5kRXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLG1CQUFtQyxTQUFRLEtBQUs7SUFFOUM7Ozs7T0FJRztJQUNILE1BQU07UUFDSixNQUFNLENBQUM7WUFDTCxNQUFNLEVBQUUsR0FBRztZQUNYLEtBQUssRUFBRSxXQUFXO1lBQ2xCLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTztTQUNyQixDQUFDO0lBQ0osQ0FBQztDQUVGO0FBZkQsZ0NBZUMiLCJmaWxlIjoianNvbmFwaS9lcnJvcnMvTm90Rm91bmRFcnJvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTm90Rm91bmRFcnJvciBleHRlbmRzIEVycm9yIHtcblxuICAvKipcbiAgICogdG9KU09OXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG4gIHRvSlNPTigpOiBhbnkge1xuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXM6IDQwNCxcbiAgICAgIHRpdGxlOiAnTm90IEZvdW5kJyxcbiAgICAgIGRldGFpbDogdGhpcy5tZXNzYWdlXG4gICAgfTtcbiAgfVxuXG59XG4iXX0=
