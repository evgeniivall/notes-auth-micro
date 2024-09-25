const { jsend, catchAsync, filterObj } = require("../utils/utils");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

class HanlderFactory {
  constructor(model, resourseName) {
    this.model = model;
    this.resourseName = resourseName;
  }
  deleteOne = () => async (req, res, next) => {
    try {
      const doc = await this.model.findByIdAndDelete(req.params.id, req.body);

      if (!doc) {
        throw new AppError(`No ${this.resourseName} with a specified ID`, 404);
      }
      jsend(res, 204, "success");
    } catch (error) {
      next(error);
    }
  };

  updateOne = (allowedProperties) => async (req, res, next) => {
    try {
      const filteredBody = filterObj(req.body, ...allowedProperties);

      if (!Object.entries(filteredBody).length) {
        throw new AppError(
          `No valid properties are specified in the body`,
          400
        );
      }
      const doc = await this.model.findByIdAndUpdate(
        req.params.id,
        filteredBody,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!doc) {
        throw new AppError(`No ${this.resourseName} with a specified ID`, 404);
      }
      jsend(res, 200, "success", { [this.resourseName]: doc });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  createOne = () => async (req, res, next) => {
    try {
      const doc = await this.model.create(req.body);

      jsend(res, 201, "success", { [this.resourseName]: doc });
    } catch (error) {
      next(error);
    }
  };

  getOne = (populateOpts) => async (req, res, next) => {
    try {
      let query = this.model.findById(req.params.id);
      if (populateOpts) query = query.populate(populateOpts);
      const doc = await query;

      if (!doc) {
        throw new AppError(`No ${this.resourseName} with a specified ID`, 404);
      }
      jsend(res, 200, "success", { [this.resourseName]: doc });
    } catch (error) {
      next(error);
    }
  };

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
        { [this.resourseName + "s"]: docs },
        { results: docs.length }
      );
    } catch (error) {
      next(error);
    }
  };
}

module.exports = HanlderFactory;
