const Task = require("./task.model");

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// CREATE
const createTaskService = async (data) => {
  const { task_name, assignment_type, start_date, end_date, priority, progress } = data;

  const today = getToday();
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  if (startDate < today) throw new Error("Start date cannot be in the past");
  if (endDate <= today) throw new Error("End date must be greater than today");
  if (endDate < startDate) throw new Error("End date cannot be before start date");

  return await Task.create({
    task_name,
    assignment_type,
    start_date: startDate,
    end_date: endDate,
    priority,
    progress: progress || 0,
  });
};

// GET ALL
const getAllTasksService = async () => {
  return await Task.find().sort({ createdAt: -1 });
};

// GET ONE
const getTaskByIdService = async (id) => {
  const task = await Task.findById(id);
  if (!task) throw new Error("Task not found");
  return task;
};

// UPDATE
const updateTaskService = async (id, data) => {
  const task = await Task.findById(id);
  if (!task) throw new Error("Task not found");

  const today = getToday();

  // date validation if provided
  if (data.start_date) {
    const startDate = new Date(data.start_date);
    if (startDate < today) throw new Error("Start date cannot be in the past");
    task.start_date = startDate;
  }

  if (data.end_date) {
    const endDate = new Date(data.end_date);
    if (endDate <= today) throw new Error("End date must be greater than today");
    task.end_date = endDate;
  }

  if (data.start_date && data.end_date) {
    if (new Date(data.end_date) < new Date(data.start_date)) {
      throw new Error("End date cannot be before start date");
    }
  }

  // update fields
  if (data.task_name) task.task_name = data.task_name;
  if (data.assignment_type) task.assignment_type = data.assignment_type;
  if (data.priority) task.priority = data.priority;
  if (data.status) task.status = data.status;
  if (data.progress !== undefined) task.progress = data.progress;

  await task.save();

  return task;
};

// DELETE
const deleteTaskService = async (id) => {
  const task = await Task.findByIdAndDelete(id);
  if (!task) throw new Error("Task not found");
  return task;
};

module.exports = {
  createTaskService,
  getAllTasksService,
  getTaskByIdService,
  updateTaskService,
  deleteTaskService,
};