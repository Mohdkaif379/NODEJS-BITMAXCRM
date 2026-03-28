const jwt = require("jsonwebtoken");
const Employee = require("../module/admin/employee/employee.model");

const authVerify = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // token me employee id hona chahiye
    const employee = await Employee.findById(decoded.id);
    if (!employee) return res.status(401).json({ message: "Invalid token" });

    req.employee = employee; // attach employee object to request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized", error: error.message });
  }
};

module.exports = authVerify;