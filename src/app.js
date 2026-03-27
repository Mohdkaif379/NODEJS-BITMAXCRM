require("dotenv").config();

const express = require("express");
const connectDB = require("./core/config/db");
const adminRoutes = require("./module/admin/admin/admin.route");
const subadminRoutes = require("./module/subadmin/subadmin.route");
const visitorRoutes = require("./module/admin/visitors/visitor.route");
const employeeRoutes = require("./module/admin/employee/employee.route");
const attendenceRoutes = require("./module/admin/Attendence/attendence.route");
const evaluationReportRoutes = require("./module/admin/evaluation/evaluationreport.route");
const expenseRoutes = require("./module/admin/expense/expense.route");
const interviewRoutes = require("./module/admin/interview/interview.route");

const app = express();

connectDB();

app.use(express.json());

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
app.use("/api/expenses", expenseRoutes);
app.use("/api/interviews", interviewRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
