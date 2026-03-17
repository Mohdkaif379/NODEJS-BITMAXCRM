const express = require("express");
const authAdmin = require("../../../core/middleware/authAdmin");
const validateObjectIdParam = require("../../../core/middleware/validateObjectIdParam");
const expenseController = require("./expense.controller");

const router = express.Router();

function requireAnyRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [];
  return function requireAnyRoleMiddleware(req, res, next) {
    const role = req?.auth?.role;
    if (!role) return res.status(401).json({ status: false, message: "Invalid token role" });
    if (!allowed.includes(role)) return res.status(403).json({ status: false, message: "Forbidden" });
    return next();
  };
}

// Admin + Subadmin
router.use(authAdmin, requireAnyRole(["admin", "subadmin"]));

router.get("/", expenseController.index);
router.post("/create", expenseController.store);
router.get("/:id", validateObjectIdParam("id"), expenseController.show);
router.put("/update/:id", validateObjectIdParam("id"), expenseController.update);
router.delete("/delete/:id", validateObjectIdParam("id"), expenseController.destroy);

module.exports = router;
