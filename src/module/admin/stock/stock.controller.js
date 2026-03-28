const {
  createStockService,
  getAllStockService,
  getStockByIdService,
  updateStockService,
  deleteStockService,
} = require("./stock.service");

// CREATE
const createStock = async (req, res) => {
  try {
    const stock = await createStockService(req.body);

    res.status(201).json({
      success: true,
      message: "Stock created successfully",
      data: stock,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET ALL
const getAllStock = async (req, res) => {
  try {
    const stocks = await getAllStockService();

    res.status(200).json({ success: true, data: stocks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ONE
const getStockById = async (req, res) => {
  try {
    const stock = await getStockByIdService(req.params.id);

    res.status(200).json({ success: true, data: stock });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// UPDATE
const updateStock = async (req, res) => {
  try {
    const stock = await updateStockService(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: stock,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE
const deleteStock = async (req, res) => {
  try {
    await deleteStockService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Stock deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

module.exports = {
  createStock,
  getAllStock,
  getStockById,
  updateStock,
  deleteStock,
};