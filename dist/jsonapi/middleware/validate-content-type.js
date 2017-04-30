'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BadRequest = require('./../errors/BadRequest');
/**
 * Build an error object for an unsupported media type.
 *
 * @param {String} contentType Value of the `Content-Type` request header
 * @return {Object}
 */
function buildUnsupportedMediaTypeError(contentType) {
    return {
        status: 415,
        title: 'Unsupported Media Type',
        detail: `Media type parameters or modifications to JSON API Content-Type header not supported ("${contentType}")`,
        links: {
            about: 'http://jsonapi.org/format/#content-negotiation-clients'
        }
    };
}
/**
 * Validate the `Content-Type` request header for JSON API compliance
 *
 * @see http://jsonapi.org/format/#content-negotiation-clients
 *
 * @param {Express.Request} req Request object
 * @param {Express.Response} res Response object
 * @param {Function} next Next middleware handler in the chain
 * @return {Mixed}
 */
function validateContentTypeMiddleware(req, res, next) {
    let contentType = (req.get('content-type') || '').trim();
    let expected = 'application/vnd.api+json';
    // Return error if `Content-Type` request header contains the JSON API
    // descriptor but contains any other additional text
    if (contentType.indexOf(expected) !== -1 && contentType !== expected) {
        return res.status(415).json({
            errors: [buildUnsupportedMediaTypeError(contentType)]
        });
        // Return error if `Content-Type` request header does not contain the JSON
        // API descriptor at all
    }
    else if (contentType !== expected) {
        let error = new BadRequest(`Unsupported value for Content-Type header ("${contentType}")`);
        error.links = {
            about: 'http://jsonapi.org/format/#content-negotiation-clients'
        };
        return res.status(400).json({
            errors: [error]
        });
    }
    next();
}
exports.default = validateContentTypeMiddleware;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzb25hcGkvbWlkZGxld2FyZS92YWxpZGF0ZS1jb250ZW50LXR5cGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUliLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBRXJEOzs7OztHQUtHO0FBQ0gsd0NBQXdDLFdBQVc7SUFDakQsTUFBTSxDQUFDO1FBQ0wsTUFBTSxFQUFFLEdBQUc7UUFDWCxLQUFLLEVBQUUsd0JBQXdCO1FBQy9CLE1BQU0sRUFBRSwwRkFBMEYsV0FBVyxJQUFJO1FBQ2pILEtBQUssRUFBRTtZQUNMLEtBQUssRUFBRSx3REFBd0Q7U0FDaEU7S0FDRixDQUFDO0FBQ0osQ0FBQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILHVDQUFzRCxHQUFvQixFQUFFLEdBQXFCLEVBQUUsSUFBMEI7SUFDM0gsSUFBSSxXQUFXLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3pELElBQUksUUFBUSxHQUFHLDBCQUEwQixDQUFDO0lBRTFDLHNFQUFzRTtJQUN0RSxvREFBb0Q7SUFDcEQsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxXQUFXLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNyRSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDMUIsTUFBTSxFQUFFLENBQUMsOEJBQThCLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDdEQsQ0FBQyxDQUFDO1FBRUwsMEVBQTBFO1FBQzFFLHdCQUF3QjtJQUN4QixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLElBQUksS0FBSyxHQUFHLElBQUksVUFBVSxDQUFDLCtDQUErQyxXQUFXLElBQUksQ0FBQyxDQUFDO1FBRTNGLEtBQUssQ0FBQyxLQUFLLEdBQUc7WUFDWixLQUFLLEVBQUUsd0RBQXdEO1NBQ2hFLENBQUM7UUFFRixNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDMUIsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDO1NBQ2hCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxJQUFJLEVBQUUsQ0FBQztBQUNULENBQUM7QUExQkQsZ0RBMEJDIiwiZmlsZSI6Impzb25hcGkvbWlkZGxld2FyZS92YWxpZGF0ZS1jb250ZW50LXR5cGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCAqIGFzIEV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5cbmNvbnN0IEJhZFJlcXVlc3QgPSByZXF1aXJlKCcuLy4uL2Vycm9ycy9CYWRSZXF1ZXN0Jyk7XG5cbi8qKlxuICogQnVpbGQgYW4gZXJyb3Igb2JqZWN0IGZvciBhbiB1bnN1cHBvcnRlZCBtZWRpYSB0eXBlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb250ZW50VHlwZSBWYWx1ZSBvZiB0aGUgYENvbnRlbnQtVHlwZWAgcmVxdWVzdCBoZWFkZXJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gYnVpbGRVbnN1cHBvcnRlZE1lZGlhVHlwZUVycm9yKGNvbnRlbnRUeXBlKSB7XG4gIHJldHVybiB7XG4gICAgc3RhdHVzOiA0MTUsXG4gICAgdGl0bGU6ICdVbnN1cHBvcnRlZCBNZWRpYSBUeXBlJyxcbiAgICBkZXRhaWw6IGBNZWRpYSB0eXBlIHBhcmFtZXRlcnMgb3IgbW9kaWZpY2F0aW9ucyB0byBKU09OIEFQSSBDb250ZW50LVR5cGUgaGVhZGVyIG5vdCBzdXBwb3J0ZWQgKFwiJHtjb250ZW50VHlwZX1cIilgLFxuICAgIGxpbmtzOiB7XG4gICAgICBhYm91dDogJ2h0dHA6Ly9qc29uYXBpLm9yZy9mb3JtYXQvI2NvbnRlbnQtbmVnb3RpYXRpb24tY2xpZW50cydcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogVmFsaWRhdGUgdGhlIGBDb250ZW50LVR5cGVgIHJlcXVlc3QgaGVhZGVyIGZvciBKU09OIEFQSSBjb21wbGlhbmNlXG4gKlxuICogQHNlZSBodHRwOi8vanNvbmFwaS5vcmcvZm9ybWF0LyNjb250ZW50LW5lZ290aWF0aW9uLWNsaWVudHNcbiAqXG4gKiBAcGFyYW0ge0V4cHJlc3MuUmVxdWVzdH0gcmVxIFJlcXVlc3Qgb2JqZWN0XG4gKiBAcGFyYW0ge0V4cHJlc3MuUmVzcG9uc2V9IHJlcyBSZXNwb25zZSBvYmplY3RcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHQgTmV4dCBtaWRkbGV3YXJlIGhhbmRsZXIgaW4gdGhlIGNoYWluXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdmFsaWRhdGVDb250ZW50VHlwZU1pZGRsZXdhcmUocmVxOiBFeHByZXNzLlJlcXVlc3QsIHJlczogRXhwcmVzcy5SZXNwb25zZSwgbmV4dDogRXhwcmVzcy5OZXh0RnVuY3Rpb24pIHtcbiAgbGV0IGNvbnRlbnRUeXBlID0gKHJlcS5nZXQoJ2NvbnRlbnQtdHlwZScpIHx8ICcnKS50cmltKCk7XG4gIGxldCBleHBlY3RlZCA9ICdhcHBsaWNhdGlvbi92bmQuYXBpK2pzb24nO1xuXG4gIC8vIFJldHVybiBlcnJvciBpZiBgQ29udGVudC1UeXBlYCByZXF1ZXN0IGhlYWRlciBjb250YWlucyB0aGUgSlNPTiBBUElcbiAgLy8gZGVzY3JpcHRvciBidXQgY29udGFpbnMgYW55IG90aGVyIGFkZGl0aW9uYWwgdGV4dFxuICBpZiAoY29udGVudFR5cGUuaW5kZXhPZihleHBlY3RlZCkgIT09IC0xICYmIGNvbnRlbnRUeXBlICE9PSBleHBlY3RlZCkge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQxNSkuanNvbih7XG4gICAgICBlcnJvcnM6IFtidWlsZFVuc3VwcG9ydGVkTWVkaWFUeXBlRXJyb3IoY29udGVudFR5cGUpXVxuICAgIH0pO1xuXG4gIC8vIFJldHVybiBlcnJvciBpZiBgQ29udGVudC1UeXBlYCByZXF1ZXN0IGhlYWRlciBkb2VzIG5vdCBjb250YWluIHRoZSBKU09OXG4gIC8vIEFQSSBkZXNjcmlwdG9yIGF0IGFsbFxuICB9IGVsc2UgaWYgKGNvbnRlbnRUeXBlICE9PSBleHBlY3RlZCkge1xuICAgIGxldCBlcnJvciA9IG5ldyBCYWRSZXF1ZXN0KGBVbnN1cHBvcnRlZCB2YWx1ZSBmb3IgQ29udGVudC1UeXBlIGhlYWRlciAoXCIke2NvbnRlbnRUeXBlfVwiKWApO1xuXG4gICAgZXJyb3IubGlua3MgPSB7XG4gICAgICBhYm91dDogJ2h0dHA6Ly9qc29uYXBpLm9yZy9mb3JtYXQvI2NvbnRlbnQtbmVnb3RpYXRpb24tY2xpZW50cydcbiAgICB9O1xuXG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHtcbiAgICAgIGVycm9yczogW2Vycm9yXVxuICAgIH0pO1xuICB9XG5cbiAgbmV4dCgpO1xufVxuIl19
