const mongoose = require("mongoose");

function validateAuthSubObjectId(req, res, next) {
  const id = req?.auth?.sub;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(401).json({ message: "Invalid token subject" });
  }
  return next();
}

module.exports = validateAuthSubObjectId;

