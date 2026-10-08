const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGO_URI;

  if (uri && uri !== 'your_mongodb_uri_here') {
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`[MongoDB Error] Failed to connect to MONGO_URI:`, error.message);
    }
  }

  // If running on Vercel serverless environment
  if (process.env.VERCEL) {
    console.warn('[MongoDB Notice] Serverless environment detected.');
    return;
  }

  // Dynamic require for local offline development to prevent serverless bundle crashes
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const path = require('path');
    const fs = require('fs');
    const os = require('os');

    const dbDir = path.join(os.tmpdir(), 'nltaskmanager_db');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        ip: '127.0.0.1',
        dbName: 'nltaskmanager',
        dbPath: dbDir,
      },
    });

    const memUri = mongoMemoryServer.getUri();
    await mongoose.connect(memUri);
    console.log(`[MongoDB] Local DB connected: ${memUri}`);
  } catch (memError) {
    console.error(`[MongoDB Local DB Error]:`, memError.message);
  }
};

module.exports = connectDB;
