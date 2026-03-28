const AssignStock = require("./assignStock.model");
const Stock = require("../stock/stock.model");
const Employee = require("../employee/employee.model");

// CREATE
const createAssignStockService = async (data) => {
  const { employee_id, stock_id, assign_quantity } = data;

  const employee = await Employee.findById(employee_id);
  if (!employee) throw new Error("Employee not found");

  const stock = await Stock.findById(stock_id);
  if (!stock) throw new Error("Stock not found");

  if (stock.quantity < assign_quantity) {
    throw new Error("Not enough stock available");
  }

  stock.quantity -= assign_quantity;
  stock.total_price = stock.quantity * stock.price;
  await stock.save();

  return await AssignStock.create(data);
};

// UPDATE 🔥
const updateAssignStockService = async (id, data) => {
  const assign = await AssignStock.findById(id);
  if (!assign) throw new Error("Assignment not found");

  const stock = await Stock.findById(assign.stock_id);
  if (!stock) throw new Error("Stock not found");

  const oldQty = assign.assign_quantity;
  const newQty = data.assign_quantity;

  if (newQty !== undefined) {
    const diff = newQty - oldQty;

    // increase assign → deduct more
    if (diff > 0) {
      if (stock.quantity < diff) {
        throw new Error("Not enough stock available");
      }
      stock.quantity -= diff;
    }

    // decrease assign → return stock
    if (diff < 0) {
      stock.quantity += Math.abs(diff);
    }

    assign.assign_quantity = newQty;
  }

  if (data.remarks !== undefined) {
    assign.remarks = data.remarks;
  }

  stock.total_price = stock.quantity * stock.price;

  await stock.save();
  await assign.save();

  return assign;
};

// GET ALL
const getAllAssignStockService = async () => {
  return await AssignStock.find()
    .populate("employee_id", "emp_name")
    .populate("stock_id", "item_name quantity")
    .sort({ createdAt: -1 });
};

// GET ONE
const getAssignStockByIdService = async (id) => {
  const data = await AssignStock.findById(id)
    .populate("employee_id")
    .populate("stock_id");

  if (!data) throw new Error("Assignment not found");

  return data;
};

// DELETE (REVERT)
const deleteAssignStockService = async (id) => {
  const assign = await AssignStock.findById(id);
  if (!assign) throw new Error("Assignment not found");

  const stock = await Stock.findById(assign.stock_id);
  if (!stock) throw new Error("Stock not found");

  stock.quantity += assign.assign_quantity;
  stock.total_price = stock.quantity * stock.price;

  await stock.save();
  await assign.deleteOne();

  return true;
};

module.exports = {
  createAssignStockService,
  updateAssignStockService,
  getAllAssignStockService,
  getAssignStockByIdService,
  deleteAssignStockService,
};