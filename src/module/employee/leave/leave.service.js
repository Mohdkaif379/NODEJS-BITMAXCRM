const Leave = require("./leave.model");

// helper for today's date (00:00:00)
const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const createLeaveService = async (data, employee) => {
  const { start_date, end_date, subject, description, leave_type, file } = data;

  const today = getToday();

  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  // validations
  if (startDate < today) {
    throw new Error("Start date cannot be in the past");
  }

  if (endDate <= today) {
    throw new Error("End date must be greater than today");
  }

  if (endDate < startDate) {
    throw new Error("End date cannot be before start date");
  }

  const leave = await Leave.create({
    employee_id: employee._id,
    start_date: startDate,
    end_date: endDate,
    subject,
    description,
    leave_type,
    file: file || null,
  });

  return leave;
};

const getMyLeavesService = async (employee) => {
  return await Leave.find({ employee_id: employee._id }).sort({ createdAt: -1 });
};

module.exports = {
  createLeaveService,
  getMyLeavesService,
};