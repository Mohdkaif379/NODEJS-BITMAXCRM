const Stock = require("./stock.model");

// CREATE
const createStockService = async (data) => {
  return await Stock.create(data);
};

// GET ALL
const getAllStockService = async () => {
  return await Stock.find().sort({ createdAt: -1 });
};

// GET ONE
const getStockByIdService = async (id) => {
  const stock = await Stock.findById(id);
  if (!stock) throw new Error("Stock not found");
  return stock;
};

// UPDATE
const updateStockService = async (id, data) => {
  const stock = await Stock.findById(id);
  if (!stock) throw new Error("Stock not found");

  if (data.item_name) stock.item_name = data.item_name;
  if (data.description) stock.description = data.description;
  if (data.quantity !== undefined) stock.quantity = data.quantity;
  if (data.price !== undefined) stock.price = data.price;
  if (data.unit) stock.unit = data.unit;

  // auto recalculate
  stock.total_price = stock.quantity * stock.price;

  await stock.save();
  return stock;
};

// DELETE
const deleteStockService = async (id) => {
  const stock = await Stock.findByIdAndDelete(id);
  if (!stock) throw new Error("Stock not found");
  return stock;
};

module.exports = {
  createStockService,
  getAllStockService,
  getStockByIdService,
  updateStockService,
  deleteStockService,
};