const Employee = require("../employee/employee.model"); // path adjust kr lena
const Leave = require("../../employee/leave/leave.model");

class DashboardService {
  // 🔹 Get recent employees
  async getRecentEmployees() {
    return await Employee.find({ status: 1 })
      .sort({ created_at: -1 })
      .limit(5)
      .select("-password"); // password hide
  }

  // 🔹 Get recent leaves
  async getRecentLeaves() {
    return await Leave.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("employee_id", "emp_name emp_email emp_code");
  }
}

module.exports = new DashboardService();