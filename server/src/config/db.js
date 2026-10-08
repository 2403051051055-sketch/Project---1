const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');
const os = require('os');

let mongoMemoryServer = null;

const connectDB = async () => {
  // Connection reuse for serverless environments
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

  // Fallback: Persistent / In-Memory database setup
  try {
    if (!mongoMemoryServer) {
      // Use os.tmpdir() to avoid EROFS read-only filesystem errors on Vercel serverless
      const dbDir = path.join(os.tmpdir(), 'nltaskmanager_db');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          ip: '127.0.0.1',
          dbName: 'nltaskmanager',
          dbPath: dbDir,
        },
      });
    }

    const memUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`[MongoDB] Database connected successfully: ${memUri}`);
  } catch (memError) {
    console.error(`[MongoDB Error] In-Memory database initialization notice:`, memError.message);
  }
};

module.exports = connectDB;
