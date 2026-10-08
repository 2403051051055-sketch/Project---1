const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const fs = require('fs');
const path = require('path');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nltaskmanager';

  try {
    // Attempt standard connection with 3-second timeout
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Notice] Local MongoDB service not detected on ${uri}`);
    console.log(`[MongoDB] Starting automatic Persistent Local MongoDB Server...`);
    
    try {
      const dbDir = path.join(__dirname, '../../.data/db');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      } else {
        const lockFile = path.join(dbDir, 'mongod.lock');
        if (fs.existsSync(lockFile)) {
          try {
            fs.unlinkSync(lockFile);
            console.log('[MongoDB] Cleaned stale lock file.');
          } catch (e) {
            console.warn('[MongoDB] Lock file notice:', e.message);
          }
        }
      }

      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          ip: '127.0.0.1',
          dbName: 'nltaskmanager',
          dbPath: dbDir,
          storageEngine: 'wiredTiger',
        },
      });
      const memUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[MongoDB] Persistent Database connected successfully: ${memUri}`);
    } catch (memError) {
      console.error(`[MongoDB Error] Failed to start Persistent Local MongoDB:`, memError.message);
    }
  }
};

module.exports = connectDB;
