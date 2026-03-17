function requireRole(role) {
  return function requireRoleMiddleware(req, res, next) {
    const tokenRole = req?.auth?.role;
    if (!tokenRole) return res.status(401).json({ message: "Invalid token role" });
    if (tokenRole !== role) return res.status(403).json({ message: "Forbidden" });
    return next();
  };
}

module.exports = requireRole;

