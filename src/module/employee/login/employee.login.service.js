const Employee = require("../../admin/employee/employee.model"); // ✅ same name use karoconst bcrypt = require("bcryptjs");
const generateToken = require("./generateToken"); 
const bcrypt = require('bcryptjs');

const employeeLoginService = async (emp_code, password) => {
  const employee = await Employee.findOne({ emp_code }).select("+password");

  if (!employee) {
    throw new Error("Employee not found");
  }

//   if (employee.status === 0) {
//     throw new Error("Employee is inactive");
//   }

  const isMatch = await bcrypt.compare(password, employee.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(employee);

  return {
    token,
    employee: {
      id: employee._id,
      emp_code: employee.emp_code,
      emp_name: employee.emp_name,
      emp_email: employee.emp_email,
      role: employee.role
    }
  };
};

module.exports = {
  employeeLoginService
};