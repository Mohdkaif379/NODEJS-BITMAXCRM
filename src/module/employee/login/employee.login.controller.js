const { employeeLoginService } = require("./employee.login.service");

const employeeLoginController = async (req, res) => {
  try {
    const { emp_code, password } = req.body;

    if (!emp_code || !password) {
      return res.status(400).json({
        success: false,
        message: "emp_code and password are required"
      });
    }

    const data = await employeeLoginService(emp_code, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  employeeLoginController
};