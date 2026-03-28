require("dotenv").config();

const express = require("express");
const connectDB = require("./core/config/db");
const adminRoutes = require("./module/admin/admin/admin.route");
const subadminRoutes = require("./module/subadmin/subadmin.route");
const visitorRoutes = require("./module/admin/visitors/visitor.route");
const employeeRoutes = require("./module/admin/employee/employee.route");
const attendenceRoutes = require("./module/admin/Attendence/attendence.route");
const evaluationReportRoutes = require("./module/admin/evaluation/evaluationreport.route");
const employeeLoginRoutes = require("./module/employee/login/employee.login.routes");
const employeeattendenceRoutes = require("./module/employee/attendence/attendence.routes");
const employeeprofileRoutes = require("./module/employee/profile/profileRoutes");
const employeeLeaveRoutes = require("./module/employee/leave/leave.routes");
const taskRoutes = require("./module/admin/task/task.routes");
const stockRoutes = require("./module/admin/stock/stock.routes");
const assignStockRoutes = require("./module/admin/assign stock/assignStock.routes");
const assignTaskRoutes = require("./module/admin/assign task/assignTask.routes");
const expenseRoutes = require("./module/admin/expense/expense.routes");
const leadRoutes = require("./module/admin/leads/lead.routes");
const leadInteractionRoutes = require("./module/admin/lead Interaction/leadInteraction.routes");
const proposalRoutes = require("./module/admin/proposal/proposal.routes");




const app = express();
app.use(express.json());
app.use("/uploads", express.static("uploads"));

connectDB();


// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Backend is running" });
});

// Register Admin Routes
app.use("/api/admins", adminRoutes);
app.use("/api/subadmins", subadminRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendence", attendenceRoutes);
app.use("/api/evaluationreports", evaluationReportRoutes);
app.use("/api/employee", employeeLoginRoutes);
app.use("/api/employee/attendence", employeeattendenceRoutes);
app.use("/api/employee/profile",employeeprofileRoutes );
app.use("/api/employee/leave",employeeLeaveRoutes );
app.use("/api/admin/task", taskRoutes);
app.use("/api/admin/stock", stockRoutes);
app.use("/api/admin/assign-stock", assignStockRoutes);
app.use("/api/admin/assign-task", assignTaskRoutes);
app.use("/api/admin/expense", expenseRoutes);
app.use("/api/admin/leads", leadRoutes);
app.use("/api/admin/lead-interaction", leadInteractionRoutes);
app.use("/api/admin/proposal", proposalRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
