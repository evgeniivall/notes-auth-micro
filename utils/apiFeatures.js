class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const query = { ...this.queryString };
    const excludeFields = ["page", "sort", "limit", "fields"];

    excludeFields.forEach((el) => delete query[el]);

    const queryString = JSON.stringify(query).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryString));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else this.query = this.query.sort("-createdAt");

    return this;
  }

  project() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else this.query = this.query.select("-__v");

    return this;
  }

  paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit;

    /*
    TODO: Handle invalid page number and respond with 400 status code
    if (this.queryString.page) {
      const numDocuments = await this.query.countDocuments();
      if (skip >= numDocuments) throw new Error('Page does not exists!');
    }
    */

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
