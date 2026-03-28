const {
  createExpenseService,
  getAllExpensesService,
  getSingleExpenseService,
  updateExpenseService,
  deleteExpenseService,
} = require("./expense.service");

// CREATE
const createExpenseController = async (req, res) => {
  try {
    const adminId = req.auth?.sub; // ✅ FIXED
    console.log("AUTH DATA:", req.auth);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Admin ID not found",
      });
    }

    const data = await createExpenseService(req.body, adminId);

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
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
const getAllExpensesController = async (req, res) => {
  try {
    const data = await getAllExpensesService(req.query);

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE
const getSingleExpenseController = async (req, res) => {
  try {
    const data = await getSingleExpenseService(req.params.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
const updateExpenseController = async (req, res) => {
  try {
    const data = await updateExpenseService(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE
const deleteExpenseController = async (req, res) => {
  try {
    await deleteExpenseService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createExpenseController,
  getAllExpensesController,
  getSingleExpenseController,
  updateExpenseController,
  deleteExpenseController,
};