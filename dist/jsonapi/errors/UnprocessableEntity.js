'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class UnprocessableEntity extends Error {
    /**
     * Set the source.pointer property on the request object
     *
     * @see http://jsonapi.org/format/#errors
     *
     * @param {String} pointer The path to the invalid query parameter
     */
    setPointer(pointer) {
        this.source = {
            pointer: pointer
        };
    }
    /**
     * Set the title for the error's serialized JSON
     *
     * @param {String} title The title to set for the error's JSON
     */
    setTitle(title) {
        this.title = title;
    }
    /**
     * toJSON
     *
     * @return {Object}
     */
    toJSON() {
        let ret = {
            status: 422,
            title: this.title || 'Unprocessable Entity',
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
exports.default = UnprocessableEntity;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzb25hcGkvZXJyb3JzL1VucHJvY2Vzc2FibGVFbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQWtCYix5QkFBeUMsU0FBUSxLQUFLO0lBNkJwRDs7Ozs7O09BTUc7SUFDSCxVQUFVLENBQUMsT0FBZTtRQUN4QixJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ1osT0FBTyxFQUFFLE9BQU87U0FDakIsQ0FBQztJQUNKLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsUUFBUSxDQUFDLEtBQWE7UUFDcEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxNQUFNO1FBQ0osSUFBSSxHQUFHLEdBQTZCO1lBQ2xDLE1BQU0sRUFBRSxHQUFHO1lBQ1gsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLElBQUksc0JBQXNCO1lBQzNDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTztTQUNyQixDQUFDO1FBRUYsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3pCLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDM0IsQ0FBQztRQUVELE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDYixDQUFDO0NBQ0Y7QUF6RUQsc0NBeUVDIiwiZmlsZSI6Impzb25hcGkvZXJyb3JzL1VucHJvY2Vzc2FibGVFbnRpdHkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmludGVyZmFjZSBMaW5rc0Fib3V0SW50ZXJmYWNlIHtcbiAgYWJvdXQ6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIFNvdXJjZVBvaW50ZXJJbnRlcmZhY2Uge1xuICBwb2ludGVyOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBFcnJvck9iamVjdEpzb25JbnRlcmZhY2Uge1xuICBzdGF0dXM6IG51bWJlcjtcbiAgdGl0bGU6IHN0cmluZztcbiAgZGV0YWlsPzogc3RyaW5nO1xuICBsaW5rcz86IExpbmtzQWJvdXRJbnRlcmZhY2U7XG4gIHNvdXJjZT86IFNvdXJjZVBvaW50ZXJJbnRlcmZhY2U7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFVucHJvY2Vzc2FibGVFbnRpdHkgZXh0ZW5kcyBFcnJvciB7XG5cbiAgLyoqXG4gICAqIEpTT04gQVBJIGBsaW5rc2AgbWVtYmVyIHJlZmVyZW5jaW5nIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gYWJvdXQgdGhpcyBlcnJvclxuICAgKlxuICAgKiBAc2VlIGh0dHA6Ly9qc29uYXBpLm9yZy9mb3JtYXQvI2Vycm9yc1xuICAgKlxuICAgKiBAdmFyIHtPYmplY3R9XG4gICAqL1xuICBsaW5rczogTGlua3NBYm91dEludGVyZmFjZTtcblxuICAvKipcbiAgICogSlNPTiBBUEkgYHNvdXJjZWAgbWVtYmVyIGlkZW50aWZ5aW5nIGZpZWxkIHRoYXQgdHJpZ2dlcmVkIHRoaXMgZXJyb3JcbiAgICpcbiAgICogQHNlZSBodHRwOi8vanNvbmFwaS5vcmcvZm9ybWF0LyNlcnJvcnNcbiAgICpcbiAgICogQHZhciB7T2JqZWN0fVxuICAgKi9cbiAgc291cmNlOiBTb3VyY2VQb2ludGVySW50ZXJmYWNlO1xuXG4gIC8qKlxuICAgKiBKU09OIEFQSSBgdGl0bGVgIG1lbWJlciBvZiB0aGUgZXJyb3Igb2JqZWN0XG4gICAqXG4gICAqIEBzZWUgaHR0cDovL2pzb25hcGkub3JnL2Zvcm1hdC8jZXJyb3JzXG4gICAqXG4gICAqIEB2YXIge1N0cmluZ31cbiAgICovXG4gIHRpdGxlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgc291cmNlLnBvaW50ZXIgcHJvcGVydHkgb24gdGhlIHJlcXVlc3Qgb2JqZWN0XG4gICAqXG4gICAqIEBzZWUgaHR0cDovL2pzb25hcGkub3JnL2Zvcm1hdC8jZXJyb3JzXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwb2ludGVyIFRoZSBwYXRoIHRvIHRoZSBpbnZhbGlkIHF1ZXJ5IHBhcmFtZXRlclxuICAgKi9cbiAgc2V0UG9pbnRlcihwb2ludGVyOiBzdHJpbmcpIHtcbiAgICB0aGlzLnNvdXJjZSA9IHtcbiAgICAgIHBvaW50ZXI6IHBvaW50ZXJcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgdGl0bGUgZm9yIHRoZSBlcnJvcidzIHNlcmlhbGl6ZWQgSlNPTlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdGl0bGUgVGhlIHRpdGxlIHRvIHNldCBmb3IgdGhlIGVycm9yJ3MgSlNPTlxuICAgKi9cbiAgc2V0VGl0bGUodGl0bGU6IHN0cmluZykge1xuICAgIHRoaXMudGl0bGUgPSB0aXRsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiB0b0pTT05cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cbiAgdG9KU09OKCkge1xuICAgIGxldCByZXQ6IEVycm9yT2JqZWN0SnNvbkludGVyZmFjZSA9IHtcbiAgICAgIHN0YXR1czogNDIyLFxuICAgICAgdGl0bGU6IHRoaXMudGl0bGUgfHwgJ1VucHJvY2Vzc2FibGUgRW50aXR5JyxcbiAgICAgIGRldGFpbDogdGhpcy5tZXNzYWdlXG4gICAgfTtcblxuICAgIGlmICh0aGlzLmhhc093blByb3BlcnR5KCdsaW5rcycpKSB7XG4gICAgICByZXQubGlua3MgPSB0aGlzLmxpbmtzO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmhhc093blByb3BlcnR5KCdzb3VyY2UnKSkge1xuICAgICAgcmV0LnNvdXJjZSA9IHRoaXMuc291cmNlO1xuICAgIH1cblxuICAgIHJldHVybiByZXQ7XG4gIH1cbn1cbiJdfQ==
