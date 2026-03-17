function stripPrivilegedAdminFields(req, _res, next) {
  if (req && req.body && typeof req.body === "object") {
    // Backend-controlled fields; do not accept from client
    delete req.body.role;
    delete req.body.permissions;
  }
  next();
}

module.exports = stripPrivilegedAdminFields;

