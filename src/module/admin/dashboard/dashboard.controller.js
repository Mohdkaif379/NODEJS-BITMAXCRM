const dashboardService = require("./dashboard.service");

class DashboardController {
  // 🔹 Recent Employees
  async getRecentEmployees(req, res) {
    try {
      const data = await dashboardService.getRecentEmployees();

      return res.status(200).json({
        success: true,
        message: "Recent employees fetched successfully",
        data,
      });
    } catch (error) {
      console.error("Error fetching employees:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // 🔹 Recent Leaves
  async getRecentLeaves(req, res) {
    try {
      const data = await dashboardService.getRecentLeaves();

      return res.status(200).json({
        success: true,
        message: "Recent leaves fetched successfully",
        data,
      });
    } catch (error) {
      console.error("Error fetching leaves:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = new DashboardController();