const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");

    if (process.env.MONGO_URI && process.env.MONGO_URI.startsWith("mongodb+srv://")) {
      console.warn("⚠️  WARNING: You are using 'mongodb+srv://'. If you see querySrv errors, switch to 'mongodb://' in .env");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      family: 4 // Use IPv4, skip trying IPv6
    });

    console.log("MongoDB Connected Successfully");

  } catch (error) {
    console.error("Database Connection Error Details:");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    if (error.message.includes("ECONNREFUSED")) {
      console.error("Tip: This often indicates a DNS issue or that your IP is not whitelisted in Atlas.");
    }
    if (error.message.includes("querySrv")) {
      console.error("SPECIFIC FIX: Your network is blocking the SRV record.");
      console.error("ACTION REQUIRED: Switch to the 'Standard Connection String' (mongodb://...) in your .env file.");
    }
    console.log("Retrying connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;