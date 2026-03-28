const {
  createAssignStockService,
  updateAssignStockService,
  getAllAssignStockService,
  getAssignStockByIdService,
  deleteAssignStockService,
} = require("./assignStock.service");

// CREATE
const createAssignStock = async (req, res) => {
  try {
    const data = await createAssignStockService(req.body);

    res.status(201).json({
      success: true,
      message: "Stock assigned successfully",
      data,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// UPDATE 🔥
const updateAssignStock = async (req, res) => {
  try {
    const data = await updateAssignStockService(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      data,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET ALL
const getAllAssignStock = async (req, res) => {
  try {
    const data = await getAllAssignStockService();

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ONE
const getAssignStockById = async (req, res) => {
  try {
    const data = await getAssignStockByIdService(req.params.id);

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// DELETE
const deleteAssignStock = async (req, res) => {
  try {
    await deleteAssignStockService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Assignment deleted & stock reverted",
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAssignStock,
  updateAssignStock,
  getAllAssignStock,
  getAssignStockById,
  deleteAssignStock,
};