const mongoose = require("mongoose");

function validateObjectIdParam(paramName) {
  return function validateObjectIdParamMiddleware(req, res, next) {
    const value = req?.params?.[paramName];
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return res.status(400).json({ message: `Invalid ${paramName}` });
    }
    next();
  };
}

module.exports = validateObjectIdParam;

