'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class ForbiddenError extends Error {
    /**
     * Set the source.pointer property on the request object
     *
     * @see http://jsonapi.org/format/#errors
     *
     * @param {String} pointer The path to the invalid attribute
     */
    setPointer(pointer) {
        this.source = {
            pointer: pointer
        };
    }
    /**
     * toJSON
     *
     * @return {Object}
     */
    toJSON() {
        let ret = {
            status: 403,
            title: 'Forbidden'
        };
        if (this.hasOwnProperty('message')) {
            ret.detail = this.message;
        }
        if (this.hasOwnProperty('links')) {
            ret.links = this.links;
        }
        if (this.hasOwnProperty('source')) {
            ret.source = this.source;
        }
        return ret;
    }
}
exports.default = ForbiddenError;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzb25hcGkvZXJyb3JzL0ZvcmJpZGRlbkVycm9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFrQmIsb0JBQW9DLFNBQVEsS0FBSztJQW9CL0M7Ozs7OztPQU1HO0lBQ0gsVUFBVSxDQUFDLE9BQWU7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRztZQUNaLE9BQU8sRUFBRSxPQUFPO1NBQ2pCLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE1BQU07UUFDSixJQUFJLEdBQUcsR0FBZ0M7WUFDckMsTUFBTSxFQUFFLEdBQUc7WUFDWCxLQUFLLEVBQUUsV0FBVztTQUNuQixDQUFDO1FBRUYsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzVCLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDekIsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUMzQixDQUFDO1FBRUQsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNiLENBQUM7Q0FDRjtBQTFERCxpQ0EwREMiLCJmaWxlIjoianNvbmFwaS9lcnJvcnMvRm9yYmlkZGVuRXJyb3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmludGVyZmFjZSBMaW5rc0Fib3V0SW50ZXJmYWNlIHtcbiAgYWJvdXQ6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIFNvdXJjZVBvaW50ZXJJbnRlcmZhY2Uge1xuICBwb2ludGVyOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBGb3JiaWRkZW5FcnJvckpzb25JbnRlcmZhY2Uge1xuICBzdGF0dXM6IG51bWJlcjtcbiAgdGl0bGU6IHN0cmluZztcbiAgZGV0YWlsPzogc3RyaW5nO1xuICBsaW5rcz86IExpbmtzQWJvdXRJbnRlcmZhY2U7XG4gIHNvdXJjZT86IFNvdXJjZVBvaW50ZXJJbnRlcmZhY2U7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZvcmJpZGRlbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuXG4gIC8qKlxuICAgKiBKU09OIEFQSSBgbGlua3NgIG1lbWJlciByZWZlcmVuY2luZyBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIGFib3V0IHRoaXMgZXJyb3JcbiAgICpcbiAgICogQHNlZSBodHRwOi8vanNvbmFwaS5vcmcvZm9ybWF0LyNlcnJvcnNcbiAgICpcbiAgICogQHZhciB7T2JqZWN0fVxuICAgKi9cbiAgbGlua3M6IExpbmtzQWJvdXRJbnRlcmZhY2U7XG5cbiAgLyoqXG4gICAqIEpTT04gQVBJIGBzb3VyY2VgIG1lbWJlciBpZGVudGlmeWluZyBmaWVsZCB0aGF0IHRyaWdnZXJlZCB0aGlzIGVycm9yXG4gICAqXG4gICAqIEBzZWUgaHR0cDovL2pzb25hcGkub3JnL2Zvcm1hdC8jZXJyb3JzXG4gICAqXG4gICAqIEB2YXIge09iamVjdH1cbiAgICovXG4gIHNvdXJjZTogU291cmNlUG9pbnRlckludGVyZmFjZTtcblxuICAvKipcbiAgICogU2V0IHRoZSBzb3VyY2UucG9pbnRlciBwcm9wZXJ0eSBvbiB0aGUgcmVxdWVzdCBvYmplY3RcbiAgICpcbiAgICogQHNlZSBodHRwOi8vanNvbmFwaS5vcmcvZm9ybWF0LyNlcnJvcnNcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBvaW50ZXIgVGhlIHBhdGggdG8gdGhlIGludmFsaWQgYXR0cmlidXRlXG4gICAqL1xuICBzZXRQb2ludGVyKHBvaW50ZXI6IHN0cmluZykge1xuICAgIHRoaXMuc291cmNlID0ge1xuICAgICAgcG9pbnRlcjogcG9pbnRlclxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogdG9KU09OXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG4gIHRvSlNPTigpOiBGb3JiaWRkZW5FcnJvckpzb25JbnRlcmZhY2Uge1xuICAgIGxldCByZXQ6IEZvcmJpZGRlbkVycm9ySnNvbkludGVyZmFjZSA9IHtcbiAgICAgIHN0YXR1czogNDAzLFxuICAgICAgdGl0bGU6ICdGb3JiaWRkZW4nXG4gICAgfTtcblxuICAgIGlmICh0aGlzLmhhc093blByb3BlcnR5KCdtZXNzYWdlJykpIHtcbiAgICAgIHJldC5kZXRhaWwgPSB0aGlzLm1lc3NhZ2U7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaGFzT3duUHJvcGVydHkoJ2xpbmtzJykpIHtcbiAgICAgIHJldC5saW5rcyA9IHRoaXMubGlua3M7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaGFzT3duUHJvcGVydHkoJ3NvdXJjZScpKSB7XG4gICAgICByZXQuc291cmNlID0gdGhpcy5zb3VyY2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfVxufVxuIl19
