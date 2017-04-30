'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class InternalServerError extends Error {
    /**
     * toJSON
     *
     * @return {Object}
     */
    toJSON() {
        return {
            status: 500,
            title: 'Internal Server Error',
            detail: 'There was an internal error processing your request. Please try again, or contact the system administrator.'
        };
    }
}
exports.default = InternalServerError;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzb25hcGkvZXJyb3JzL0ludGVybmFsU2VydmVyRXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLHlCQUF5QyxTQUFRLEtBQUs7SUFFcEQ7Ozs7T0FJRztJQUNILE1BQU07UUFDSixNQUFNLENBQUM7WUFDTCxNQUFNLEVBQUUsR0FBRztZQUNYLEtBQUssRUFBRSx1QkFBdUI7WUFDOUIsTUFBTSxFQUFFLDZHQUE2RztTQUN0SCxDQUFDO0lBQ0osQ0FBQztDQUVGO0FBZkQsc0NBZUMiLCJmaWxlIjoianNvbmFwaS9lcnJvcnMvSW50ZXJuYWxTZXJ2ZXJFcnJvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50ZXJuYWxTZXJ2ZXJFcnJvciBleHRlbmRzIEVycm9yIHtcblxuICAvKipcbiAgICogdG9KU09OXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG4gIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzOiA1MDAsXG4gICAgICB0aXRsZTogJ0ludGVybmFsIFNlcnZlciBFcnJvcicsXG4gICAgICBkZXRhaWw6ICdUaGVyZSB3YXMgYW4gaW50ZXJuYWwgZXJyb3IgcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QuIFBsZWFzZSB0cnkgYWdhaW4sIG9yIGNvbnRhY3QgdGhlIHN5c3RlbSBhZG1pbmlzdHJhdG9yLidcbiAgICB9O1xuICB9XG5cbn1cbiJdfQ==
