const express = require("express");
const router = express.Router();
const { employeeLoginController } = require("./employee.login.controller");

// Employee Login Route
router.post("/login", employeeLoginController);

module.exports = router;