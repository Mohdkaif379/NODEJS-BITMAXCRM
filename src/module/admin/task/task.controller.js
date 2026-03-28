const {
  createTaskService,
  getAllTasksService,
  getTaskByIdService,
  updateTaskService,
  deleteTaskService,
} = require("./task.service");

// CREATE
const createTask = async (req, res) => {
  try {
    const task = await createTaskService(req.body);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET ALL
const getAllTasks = async (req, res) => {
  try {
    const tasks = await getAllTasksService();

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ONE
const getTaskById = async (req, res) => {
  try {
    const task = await getTaskByIdService(req.params.id);

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// UPDATE
const updateTask = async (req, res) => {
  try {
    const task = await updateTaskService(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE
const deleteTask = async (req, res) => {
  try {
    await deleteTaskService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};