const {
  createLeaveService,
  getMyLeavesService,
} = require("./leave.service");

// CREATE LEAVE
const createLeave = async (req, res) => {
  try {
    const leave = await createLeaveService(
      req.body,
      req.employee
    );

    return res.status(201).json({
      success: true,
      message: "Leave applied successfully",
      data: leave,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET MY LEAVES
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await getMyLeavesService(req.employee);

    return res.status(200).json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createLeave,
  getMyLeaves,
};