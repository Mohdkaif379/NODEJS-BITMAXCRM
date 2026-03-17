const employeeService = require("./employee.service");

function sendError(res, err) {
  const statusCode = err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";
  if (err?.code === 11000) return res.status(409).json({ message: "Duplicate key" });
  return res.status(statusCode).json({ message });
}

async function createEmployee(req, res) {
  try {
    const result = await employeeService.createEmployee(req.body);
    return res.status(201).json({ message: "Employee created", data: result });
  } catch (err) {
    return sendError(res, err);
  }
}

async function listEmployees(_req, res) {
  try {
    const employees = await employeeService.listEmployees();
    return res.status(200).json({ data: employees });
  } catch (err) {
    return sendError(res, err);
  }
}

async function getEmployee(req, res) {
  try {
    const result = await employeeService.getEmployeeById(req.params.id);
    return res.status(200).json({ data: result });
  } catch (err) {
    return sendError(res, err);
  }
}

async function updateEmployee(req, res) {
  try {
    const result = await employeeService.updateEmployee(req.params.id, req.body);
    return res.status(200).json({ message: "Employee updated", data: result });
  } catch (err) {
    return sendError(res, err);
  }
}

async function deleteEmployee(req, res) {
  try {
    const employee = await employeeService.deleteEmployee(req.params.id);
    return res.status(200).json({ message: "Employee deleted", data: employee });
  } catch (err) {
    return sendError(res, err);
  }
}

module.exports = {
  createEmployee,
  listEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee
};
