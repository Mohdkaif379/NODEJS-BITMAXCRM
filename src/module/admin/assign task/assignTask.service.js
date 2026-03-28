const AssignTask = require("./assignTask.model");
const Task = require("../task/task.model");
const Employee = require("../employee/employee.model");

// CREATE
const createAssignTaskService = async (data) => {
  const { employee_id, task_id } = data;

  // employee check
  const employee = await Employee.findById(employee_id);
  if (!employee) throw new Error("Employee not found");

  // task check
  const task = await Task.findById(task_id);
  if (!task) throw new Error("Task not found");

  // already assigned check 🔥
  const alreadyAssigned = await AssignTask.findOne({ task_id });
  if (alreadyAssigned) {
    throw new Error("Task already assigned to another employee");
  }

  // create
  const assign = await AssignTask.create({
    employee_id,
    task_id,
  });

  return assign;
};

// GET ALL
const getAllAssignTaskService = async () => {
  return await AssignTask.find()
    .populate("employee_id", "emp_name emp_email")
    .populate("task_id", "task_name status priority")
    .sort({ createdAt: -1 });
};

module.exports = {
  createAssignTaskService,
  getAllAssignTaskService,
};