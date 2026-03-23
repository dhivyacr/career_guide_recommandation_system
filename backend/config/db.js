const mongoose = require("mongoose");

let connectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/intelligent_career_guidance";

  connectionPromise = mongoose.connect(mongoUri).then((connection) => {
    console.log("MongoDB connected");
    return connection;
  });

  try {
    return await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
}

module.exports = connectDB;
