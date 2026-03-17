const expenseService = require("./expense.service");

function sendError(res, err) {
  const statusCode = err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";
  return res.status(statusCode).json({ status: false, message });
}

async function index(req, res) {
  try {
    const result = await expenseService.listExpenses(req.query);
    return res.status(200).json({
      status: true,
      message: "Expenses fetched successfully.",
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) {
    return sendError(res, err);
  }
}

async function store(req, res) {
  try {
    const expense = await expenseService.createExpense(req.body, req.auth);
    return res.status(201).json({
      status: true,
      message: "Expense created successfully.",
      data: expense
    });
  } catch (err) {
    return sendError(res, err);
  }
}

async function show(req, res) {
  try {
    const expense = await expenseService.getExpenseById(req.params.id);
    return res.status(200).json({
      status: true,
      message: "Expense fetched successfully.",
      data: expense
    });
  } catch (err) {
    return sendError(res, err);
  }
}

async function update(req, res) {
  try {
    const expense = await expenseService.updateExpense(req.params.id, req.body);
    return res.status(200).json({
      status: true,
      message: "Expense updated successfully.",
      data: expense
    });
  } catch (err) {
    return sendError(res, err);
  }
}

async function destroy(req, res) {
  try {
    await expenseService.deleteExpense(req.params.id);
    return res.status(200).json({
      status: true,
      message: "Expense deleted successfully."
    });
  } catch (err) {
    return sendError(res, err);
  }
}

module.exports = {
  index,
  store,
  show,
  update,
  destroy
};
