const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "";

  if (mongoUri.trim()) {
    try {
      await mongoose.connect(mongoUri);
      return;
    } catch (error) {
      // Fall back to in-memory DB for local development only.
      // eslint-disable-next-line no-console
      console.warn("MongoDB local no disponible. Se usará Mongo en memoria.");
    }
  }

  const memoryServer = await MongoMemoryServer.create();
  const memoryUri = memoryServer.getUri();
  await mongoose.connect(memoryUri);
};

module.exports = connectDB;
