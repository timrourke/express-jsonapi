'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class Controller {
    /**
     * Constructor.
     *
     * @param {Sequelize.Model}
     */
    constructor(model) {
        this.model = model;
    }
    /**
     * Get a single instance of a model
     *
     * @param {String|Number} id Primary ID of the model
     * @return {Promise}
     */
    getOne(id) {
        return new Promise((resolve, reject) => {
            this.model.findById(id).then((foundModel) => {
                resolve(foundModel);
            }).catch((error) => {
                reject(error);
            });
        });
    }
    /**
     * Get a list of model instances
     *
     * @param {Object} sequelizeQueryParams The query params to pass to the query builder
     * @return {Promise}
     */
    getList(sequelizeQueryParams = {}) {
        return new Promise((resolve, reject) => {
            this.model.findAndCountAll(sequelizeQueryParams).then(result => {
                resolve(result);
            }).catch((error) => {
                reject(error);
            });
        });
    }
    /**
     * Create a single model instance.
     *
     * @param {Object} attrs Attributes to create the model with
     * @return {Promise}
     */
    createOne(attrs) {
        return new Promise((resolve, reject) => {
            this.model.create(attrs).then((newModel) => {
                resolve(newModel);
            }).catch((error) => {
                reject(error);
            });
        });
    }
    /**
     * Update a single model instance. Resolves with a null value
     * if the model cannot be found by the provided ID.
     *
     * @param {String|Number} id Primary ID of the model
     * @param {Object} attrs Attributes to update on the model
     * @return {Promise}
     */
    updateOne(id, attrs) {
        return new Promise((resolve, reject) => {
            this.model.findById(id).then((foundModel) => {
                if (!foundModel) {
                    return resolve(null);
                }
                foundModel.update(attrs).then((updatedModel) => {
                    resolve(updatedModel);
                }).catch((error) => {
                    reject(error);
                });
            }).catch(function () {
                reject(arguments);
            });
        });
    }
    /**
     * Delete a single model instance by ID. Resolves with a null value if the
     * model cannot be found by the provided ID.
     *
     * @param {String|Number} id Primary ID of the model
     * @return {Promise}
     */
    deleteOne(id) {
        return new Promise((resolve, reject) => {
            this.model.findById(id).then((foundModel) => {
                if (!foundModel) {
                    return resolve(null);
                }
                foundModel.destroy().then(() => {
                    resolve(foundModel);
                }).catch((error) => {
                    reject(error);
                });
            }).catch((error) => {
                reject(error);
            });
        });
    }
}
exports.default = Controller;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRyb2xsZXJzL2NvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQW9CYjtJQUlFOzs7O09BSUc7SUFDSCxZQUFZLEtBQXNCO1FBQ2hDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxFQUFFO1FBQ1AsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBaUIsRUFBRSxNQUFnQjtZQUNyRCxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUE4QjtnQkFDMUQsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQVk7Z0JBQ3BCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNoQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsT0FBTyxDQUFDLG9CQUFvQixHQUFHLEVBQUU7UUFDL0IsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBaUIsRUFBRSxNQUFnQjtZQUNyRCxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNO2dCQUMxRCxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBWTtnQkFDcEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFTLENBQUMsS0FBVTtRQUNsQixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFpQixFQUFFLE1BQWdCO1lBQ3JELElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQTRCO2dCQUN6RCxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBWTtnQkFDcEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILFNBQVMsQ0FBQyxFQUFFLEVBQUUsS0FBVTtRQUN0QixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFpQixFQUFFLE1BQWdCO1lBQ3JELElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQThCO2dCQUMxRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0JBQ2hCLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZCLENBQUM7Z0JBRUQsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxZQUFnQztvQkFDN0QsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN4QixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFZO29CQUNwQixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2hCLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUNQLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNwQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILFNBQVMsQ0FBQyxFQUFFO1FBQ1YsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBaUIsRUFBRSxNQUFnQjtZQUNyRCxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUE4QjtnQkFDMUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUNoQixNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN2QixDQUFDO2dCQUVELFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7b0JBQ3hCLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDdEIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBWTtvQkFDcEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNoQixDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQVk7Z0JBQ3BCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNoQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUVGO0FBaEhELDZCQWdIQyIsImZpbGUiOiJjb250cm9sbGVycy9jb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBJbnN0YW5jZSwgTW9kZWwgfSBmcm9tICdzZXF1ZWxpemUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbnRyb2xsZXJDb25zdHJ1Y3RvciB7XG4gIG5ldyAobW9kZWw6IE1vZGVsPGFueSwgYW55Pik6IENvbnRyb2xsZXJJbnRlcmZhY2U7XG59XG5cbmludGVyZmFjZSBDb250cm9sbGVySW50ZXJmYWNlIHtcbiAgZ2V0T25lKGlkKTogUHJvbWlzZTxJbnN0YW5jZTxhbnksIGFueT4+O1xuXG4gIGdldExpc3Qoc2VxdWVsaXplUXVlcnlQYXJhbXMpOiBQcm9taXNlPEFycmF5PEluc3RhbmNlPGFueSwgYW55Pj4+O1xuXG4gIGNyZWF0ZU9uZShhdHRyczogYW55KTogUHJvbWlzZTxJbnN0YW5jZTxhbnksIGFueT4+O1xuXG4gIHVwZGF0ZU9uZShpZCwgYXR0cnM6IGFueSk6IFByb21pc2U8SW5zdGFuY2U8YW55LCBhbnk+PjtcblxuICBkZWxldGVPbmUoaWQpOiBQcm9taXNlPEluc3RhbmNlPGFueSwgYW55Pj47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRyb2xsZXIgaW1wbGVtZW50cyBDb250cm9sbGVySW50ZXJmYWNlIHtcblxuICBtb2RlbDogTW9kZWw8YW55LCBhbnk+O1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHtTZXF1ZWxpemUuTW9kZWx9XG4gICAqL1xuICBjb25zdHJ1Y3Rvcihtb2RlbDogTW9kZWw8YW55LCBhbnk+KSB7XG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNpbmdsZSBpbnN0YW5jZSBvZiBhIG1vZGVsXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gaWQgUHJpbWFyeSBJRCBvZiB0aGUgbW9kZWxcbiAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICovXG4gIGdldE9uZShpZCk6IFByb21pc2U8SW5zdGFuY2U8YW55LCBhbnk+PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlOiBGdW5jdGlvbiwgcmVqZWN0OiBGdW5jdGlvbikgPT4ge1xuICAgICAgdGhpcy5tb2RlbC5maW5kQnlJZChpZCkudGhlbigoZm91bmRNb2RlbDogSW5zdGFuY2U8YW55LCBhbnk+KSA9PiB7XG4gICAgICAgIHJlc29sdmUoZm91bmRNb2RlbCk7XG4gICAgICB9KS5jYXRjaCgoZXJyb3I6IEVycm9yKSA9PiB7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBsaXN0IG9mIG1vZGVsIGluc3RhbmNlc1xuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gc2VxdWVsaXplUXVlcnlQYXJhbXMgVGhlIHF1ZXJ5IHBhcmFtcyB0byBwYXNzIHRvIHRoZSBxdWVyeSBidWlsZGVyXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqL1xuICBnZXRMaXN0KHNlcXVlbGl6ZVF1ZXJ5UGFyYW1zID0ge30pOiBQcm9taXNlPEFycmF5PEluc3RhbmNlPGFueSwgYW55Pj4+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmU6IEZ1bmN0aW9uLCByZWplY3Q6IEZ1bmN0aW9uKSA9PiB7XG4gICAgICB0aGlzLm1vZGVsLmZpbmRBbmRDb3VudEFsbChzZXF1ZWxpemVRdWVyeVBhcmFtcykudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICB9KS5jYXRjaCgoZXJyb3I6IEVycm9yKSA9PiB7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBzaW5nbGUgbW9kZWwgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRycyBBdHRyaWJ1dGVzIHRvIGNyZWF0ZSB0aGUgbW9kZWwgd2l0aFxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKi9cbiAgY3JlYXRlT25lKGF0dHJzOiBhbnkpOiBQcm9taXNlPEluc3RhbmNlPGFueSwgYW55Pj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZTogRnVuY3Rpb24sIHJlamVjdDogRnVuY3Rpb24pID0+IHtcbiAgICAgIHRoaXMubW9kZWwuY3JlYXRlKGF0dHJzKS50aGVuKChuZXdNb2RlbDogSW5zdGFuY2U8YW55LCBhbnk+KSA9PiB7XG4gICAgICAgIHJlc29sdmUobmV3TW9kZWwpO1xuICAgICAgfSkuY2F0Y2goKGVycm9yOiBFcnJvcikgPT4ge1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIGEgc2luZ2xlIG1vZGVsIGluc3RhbmNlLiBSZXNvbHZlcyB3aXRoIGEgbnVsbCB2YWx1ZVxuICAgKiBpZiB0aGUgbW9kZWwgY2Fubm90IGJlIGZvdW5kIGJ5IHRoZSBwcm92aWRlZCBJRC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8TnVtYmVyfSBpZCBQcmltYXJ5IElEIG9mIHRoZSBtb2RlbFxuICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnMgQXR0cmlidXRlcyB0byB1cGRhdGUgb24gdGhlIG1vZGVsXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqL1xuICB1cGRhdGVPbmUoaWQsIGF0dHJzOiBhbnkpOiBQcm9taXNlPEluc3RhbmNlPGFueSwgYW55Pj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZTogRnVuY3Rpb24sIHJlamVjdDogRnVuY3Rpb24pID0+IHtcbiAgICAgIHRoaXMubW9kZWwuZmluZEJ5SWQoaWQpLnRoZW4oKGZvdW5kTW9kZWw6IEluc3RhbmNlPGFueSwgYW55PikgPT4ge1xuICAgICAgICBpZiAoIWZvdW5kTW9kZWwpIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvdW5kTW9kZWwudXBkYXRlKGF0dHJzKS50aGVuKCh1cGRhdGVkTW9kZWw6IEluc3RhbmNlPGFueSwgYW55PikgPT4ge1xuICAgICAgICAgIHJlc29sdmUodXBkYXRlZE1vZGVsKTtcbiAgICAgICAgfSkuY2F0Y2goKGVycm9yOiBFcnJvcikgPT4ge1xuICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIH0pO1xuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChhcmd1bWVudHMpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlIGEgc2luZ2xlIG1vZGVsIGluc3RhbmNlIGJ5IElELiBSZXNvbHZlcyB3aXRoIGEgbnVsbCB2YWx1ZSBpZiB0aGVcbiAgICogbW9kZWwgY2Fubm90IGJlIGZvdW5kIGJ5IHRoZSBwcm92aWRlZCBJRC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8TnVtYmVyfSBpZCBQcmltYXJ5IElEIG9mIHRoZSBtb2RlbFxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKi9cbiAgZGVsZXRlT25lKGlkKTogUHJvbWlzZTxJbnN0YW5jZTxhbnksIGFueT4+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmU6IEZ1bmN0aW9uLCByZWplY3Q6IEZ1bmN0aW9uKSA9PiB7XG4gICAgICB0aGlzLm1vZGVsLmZpbmRCeUlkKGlkKS50aGVuKChmb3VuZE1vZGVsOiBJbnN0YW5jZTxhbnksIGFueT4pID0+IHtcbiAgICAgICAgaWYgKCFmb3VuZE1vZGVsKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUobnVsbCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3VuZE1vZGVsLmRlc3Ryb3koKS50aGVuKCgpID0+IHtcbiAgICAgICAgICByZXNvbHZlKGZvdW5kTW9kZWwpO1xuICAgICAgICB9KS5jYXRjaCgoZXJyb3I6IEVycm9yKSA9PiB7XG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgICB9KS5jYXRjaCgoZXJyb3I6IEVycm9yKSA9PiB7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG59XG4iXX0=
