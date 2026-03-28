const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    item_name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    price: {
      type: Number, // per unit price
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    total_price: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);



module.exports = mongoose.model("Stock", stockSchema);