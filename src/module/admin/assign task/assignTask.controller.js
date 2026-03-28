const {
  createAssignTaskService,
  getAllAssignTaskService,
} = require("./assignTask.service");

// CREATE
const createAssignTask = async (req, res) => {
  try {
    const data = await createAssignTaskService(req.body);

    res.status(201).json({
      success: true,
      message: "Task assigned successfully",
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL
const getAllAssignTask = async (req, res) => {
  try {
    const data = await getAllAssignTaskService();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createAssignTask,
  getAllAssignTask,
};