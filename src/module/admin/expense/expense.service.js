const Expense = require("./expense.model");
const mongoose = require("mongoose");

// DATE VALIDATION
const validateDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expenseDate = new Date(date);

  if (expenseDate < today) {
    throw new Error("Past dates are not allowed");
  }
};

// ID VALIDATION
const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid Expense ID");
  }
};

// CREATE
const createExpenseService = async (data, adminId) => {
  if (!data.expense_date) {
    throw new Error("Expense date is required");
  }

  validateDate(data.expense_date);

  return await Expense.create({
    ...data,
    created_by: adminId,
  });
};

// GET ALL
const getAllExpensesService = async (query) => {
  let { page = 1, limit = 10, search = "", month, day } = query;

  page = parseInt(page);
  limit = parseInt(limit);

  const skip = (page - 1) * limit;

  let filter = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  if (month) {
    const year = new Date().getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    filter.expense_date = { $gte: start, $lte: end };
  }

  if (day) {
    const start = new Date(day);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);

    filter.expense_date = { $gte: start, $lte: end };
  }

  const expenses = await Expense.find(filter)
    .populate("created_by", "name email")
    .sort({ expense_date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Expense.countDocuments(filter);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    expenses,
  };
};

// GET SINGLE
const getSingleExpenseService = async (id) => {
  validateObjectId(id);

  const expense = await Expense.findById(id).populate(
    "created_by",
    "name email"
  );

  if (!expense) {
    throw new Error("Expense not found");
  }

  return expense;
};

// UPDATE
const updateExpenseService = async (id, data) => {
  validateObjectId(id);

  if (data.expense_date) {
    validateDate(data.expense_date);
  }

  const updated = await Expense.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new Error("Expense not found");
  }

  return updated;
};

// DELETE
const deleteExpenseService = async (id) => {
  validateObjectId(id);

  const deleted = await Expense.findByIdAndDelete(id);

  if (!deleted) {
    throw new Error("Expense not found");
  }

  return deleted;
};

module.exports = {
  createExpenseService,
  getAllExpensesService,
  getSingleExpenseService,
  updateExpenseService,
  deleteExpenseService,
};