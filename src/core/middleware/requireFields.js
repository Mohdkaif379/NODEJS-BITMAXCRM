function requireFields(fields) {
  return function requireFieldsMiddleware(req, res, next) {
    const body = req?.body || {};
    const missing = [];

    for (const field of fields) {
      if (body[field] === undefined || body[field] === null || body[field] === "") missing.push(field);
    }

    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
    }

    next();
  };
}

module.exports = requireFields;

