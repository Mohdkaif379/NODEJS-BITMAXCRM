function stripRoleField(req, _res, next) {
  if (req && req.body && typeof req.body === "object") {
    // Backend-controlled
    delete req.body.role;
  }
  next();
}

module.exports = stripRoleField;

