exports.jsend = function (res, httpStatus, status, payload, customProperties) {
  const success = status === "success";

  res.status(httpStatus).json({
    status: status,
    ...(customProperties && { ...customProperties }),
    ...(success && payload && { data: { ...payload } }),
    ...(!success && { message: payload }),
  });
};

exports.filterObj = (object, ...allowedProperties) => {
  const filteredObj = {};

  for (const property in object) {
    if (allowedProperties.includes(property)) {
      filteredObj[property] = object[property];
    }
  }

  return filteredObj;
};
