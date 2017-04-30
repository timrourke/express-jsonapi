'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class BadRequest extends Error {
    /**
     * Set the source property on the request object
     *
     * @see http://jsonapi.org/format/#errors
     *
     * @param {String} param The invalid query parameter
     */
    setSource(param) {
        this.source = {
            parameter: param
        };
    }
    /**
     * Serialize the instance into a JSON API error object
     *
     * @see http://jsonapi.org/format/#errors
     *
     * @return {Object}
     */
    toJSON() {
        let ret = {
            status: 400,
            title: 'Bad Request',
            detail: this.message
        };
        if (this.hasOwnProperty('links')) {
            ret.links = this.links;
        }
        if (this.hasOwnProperty('source')) {
            ret.source = this.source;
        }
        return ret;
    }
}
exports.default = BadRequest;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzb25hcGkvZXJyb3JzL0JhZFJlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLGdCQUFnQyxTQUFRLEtBQUs7SUFzQjNDOzs7Ozs7T0FNRztJQUNJLFNBQVMsQ0FBQyxLQUFhO1FBQzVCLElBQUksQ0FBQyxNQUFNLEdBQUc7WUFDWixTQUFTLEVBQUUsS0FBSztTQUNqQixDQUFDO0lBQ0osQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILE1BQU07UUFDSixJQUFJLEdBQUcsR0FBUTtZQUNiLE1BQU0sRUFBRSxHQUFHO1lBQ1gsS0FBSyxFQUFFLGFBQWE7WUFDcEIsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPO1NBQ3JCLENBQUM7UUFFRixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDekIsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUMzQixDQUFDO1FBRUQsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNiLENBQUM7Q0FFRjtBQTVERCw2QkE0REMiLCJmaWxlIjoianNvbmFwaS9lcnJvcnMvQmFkUmVxdWVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFkUmVxdWVzdCBleHRlbmRzIEVycm9yIHtcblxuICAvKipcbiAgICogSlNPTiBBUEkgbGlua3MgcHJvcGVydHkgY29udGFpbmluZyBhbiBgYWJvdXRgIG1lbWJlciB0aGF0IGxlYWRzIHRvIGZ1cnRoZXJcbiAgICogZGV0YWlscyBhYm91dCB0aGlzIHBhcnRpY3VsYXIgb2NjdXJyZW5jZSBvZiB0aGUgcHJvYmxlbVxuICAgKlxuICAgKiBAc2VlIGh0dHA6Ly9qc29uYXBpLm9yZy9mb3JtYXQvI2Vycm9yc1xuICAgKlxuICAgKiBAdmFyIHttaXhlZH1cbiAgICovXG4gIHB1YmxpYyBsaW5rczogYW55O1xuXG4gIC8qKlxuICAgKiBKU09OIEFQSSBzb3VyY2UgcHJvcGVydHkgcmVmZXJyaW5nIHRvIHRoZSBxdWVyeSBwYXJhbWV0ZXIgdGhhdCBjYXVzZWQgdGhlXG4gICAqIGVycm9yXG4gICAqXG4gICAqIEBzZWUgaHR0cDovL2pzb25hcGkub3JnL2Zvcm1hdC8jZXJyb3JzXG4gICAqXG4gICAqIEB2YXIge21peGVkfVxuICAgKi9cbiAgcHVibGljIHNvdXJjZTogYW55O1xuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHNvdXJjZSBwcm9wZXJ0eSBvbiB0aGUgcmVxdWVzdCBvYmplY3RcbiAgICpcbiAgICogQHNlZSBodHRwOi8vanNvbmFwaS5vcmcvZm9ybWF0LyNlcnJvcnNcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmFtIFRoZSBpbnZhbGlkIHF1ZXJ5IHBhcmFtZXRlclxuICAgKi9cbiAgcHVibGljIHNldFNvdXJjZShwYXJhbTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zb3VyY2UgPSB7XG4gICAgICBwYXJhbWV0ZXI6IHBhcmFtXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXJpYWxpemUgdGhlIGluc3RhbmNlIGludG8gYSBKU09OIEFQSSBlcnJvciBvYmplY3RcbiAgICpcbiAgICogQHNlZSBodHRwOi8vanNvbmFwaS5vcmcvZm9ybWF0LyNlcnJvcnNcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cbiAgdG9KU09OKCkge1xuICAgIGxldCByZXQ6IGFueSA9IHtcbiAgICAgIHN0YXR1czogNDAwLFxuICAgICAgdGl0bGU6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBkZXRhaWw6IHRoaXMubWVzc2FnZVxuICAgIH07XG5cbiAgICBpZiAodGhpcy5oYXNPd25Qcm9wZXJ0eSgnbGlua3MnKSkge1xuICAgICAgcmV0LmxpbmtzID0gdGhpcy5saW5rcztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5oYXNPd25Qcm9wZXJ0eSgnc291cmNlJykpIHtcbiAgICAgIHJldC5zb3VyY2UgPSB0aGlzLnNvdXJjZTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbn1cbiJdfQ==
