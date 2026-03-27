const { verifyJwtHs256 } = require("../utils/jwt");
 
function authAdmin(req, res, next) {
  try {
    const header = req.headers?.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Authorization token missing" });
    }
 
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT_SECRET is not set in environment" });
    }
 
    const payload = verifyJwtHs256(token, secret);
    req.auth = payload;
    return next();
  } catch (err) {
    const message = err?.message === "Token expired" ? "Token expired" : "Invalid token";
    return res.status(401).json({ message });
  }
}
 
module.exports = authAdmin;