const { jsend, filterObj } = require("../utils/utils");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

/**
 * HandlerFactory Class
 * Provides generic CRUD operations for a given Mongoose model.
 */
class HandlerFactory {
  /**
   * Creates an instance of HandlerFactory.
   * @param {Model} model - Mongoose model for the resource.
   * @param {string} resourceName - Name of the resource for error messages and response formatting.
   */
  constructor(model, resourceName) {
    this.model = model;
    this.resourceName = resourceName;
  }

  /**
   * Deletes a single document by ID.
   * @returns {Function} - Express middleware function.
   * @example
   * // Usage in a route
   * app.delete('/api/v1/resource/:id', handlerFactoryInstance.deleteOne());
   */
  deleteOne = () => async (req, res, next) => {
    try {
      const doc = await this.model.findByIdAndDelete(req.params.id);

      if (!doc) {
        throw new AppError(
          `No ${this.resourceName} found with the specified ID`,
          404
        );
      }

      jsend(res, 204, "success");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Updates a single document by ID with only allowed properties.
   * @param {string[]} allowedProperties - Array of allowed properties to update.
   * @returns {Function} - Express middleware function.
   * @example
   * // Usage in a route
   * app.patch('/api/v1/resource/:id', handlerFactoryInstance.updateOne(['name', 'email']));
   */
  updateOne = (allowedProperties) => async (req, res, next) => {
    try {
      // Filter out unwanted fields from the request body
      const filteredBody = filterObj(req.body, ...allowedProperties);

      if (!Object.keys(filteredBody).length) {
        throw new AppError(`No valid properties specified in the body`, 400);
      }

      // Update the document
      const doc = await this.model.findByIdAndUpdate(
        req.params.id,
        filteredBody,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!doc) {
        throw new AppError(
          `No ${this.resourceName} found with the specified ID`,
          404
        );
      }

      jsend(res, 200, "success", { [this.resourceName]: doc });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Creates a new document.
   * @returns {Function} - Express middleware function.
   * @example
   * // Usage in a route
   * app.post('/api/v1/resource', handlerFactoryInstance.createOne());
   */
  createOne = () => async (req, res, next) => {
    try {
      const doc = await this.model.create(req.body);

      jsend(res, 201, "success", { [this.resourceName]: doc });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Gets a single document by ID, with optional population of related fields.
   * @param {Object} [populateOpts] - Mongoose population options.
   * @returns {Function} - Express middleware function.
   * @example
   * // Usage in a route
   * app.get('/api/v1/resource/:id', handlerFactoryInstance.getOne({ path: 'relatedField' }));
   */
  getOne = (populateOpts) => async (req, res, next) => {
    try {
      let query = this.model.findById(req.params.id);
      if (populateOpts) query = query.populate(populateOpts);

      const doc = await query;

      if (!doc) {
        throw new AppError(
          `No ${this.resourceName} found with the specified ID`,
          404
        );
      }

      jsend(res, 200, "success", { [this.resourceName]: doc });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Gets all documents, with optional filtering, sorting, field limiting, and pagination.
   * @param {Function} [filterCb] - Optional callback to create custom filter object based on request.
   * @returns {Function} - Express middleware function.
   * @example
   * // Usage in a route
   * app.get('/api/v1/resource', handlerFactoryInstance.getAll());
   * app.get('/api/v1/resource', handlerFactoryInstance.getAll((req) => ({ active: true })));
   */
  getAll = (filterCb) => async (req, res, next) => {
    try {
      let filter = {};
      if (filterCb) filter = filterCb(req);

      const features = new APIFeatures(this.model.find(filter), req.query)
        .filter()
        .sort()
        .project()
        .paginate();

      const docs = await features.query;

      jsend(
        res,
        200,
        "success",
        { [`${this.resourceName}s`]: docs },
        { results: docs.length }
      );
    } catch (error) {
      next(error);
    }
  };
}

module.exports = HandlerFactory;
