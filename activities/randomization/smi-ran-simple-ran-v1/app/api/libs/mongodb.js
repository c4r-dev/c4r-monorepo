const logger = require('../../../../../../packages/logging/logger.js');
// import { mongoose } from 'mongoose'
// const MONGODB_URI =
//   'mongodb+srv://c4rdfischer4623:df4623DF!@serverlessaws.onx2ah0.mongodb.net/c4r?retryWrites=true&w=majority&appName=ServerlessAWS'
// const connectMongoDB = async () => {
//   try {
//     await mongoose.connect(MONGODB_URI)
//     logger.app.info('Connected to MongoDB.')
//   } catch (error) {
//     logger.app.info(error)
//   }
// }

// export default connectMongoDB


// File: lib/mongodb.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  logger.app.error('MONGODB_URI environment variable is not defined!');
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

logger.app.info('MongoDB connection string available:', MONGODB_URI ? 'Yes' : 'No');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectMongoDB() {
  if (cached.conn) {
    logger.app.info('Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    logger.app.info('Creating new MongoDB connection...');
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        logger.app.info('MongoDB connected successfully');
        return mongoose;
      })
      .catch(err => {
        logger.app.error('MongoDB connection error:', err);
        cached.promise = null;
        throw err;
      });
  }
  
  try {
    logger.app.info('Waiting for MongoDB connection...');
    cached.conn = await cached.promise;
    logger.app.info('MongoDB connection established');
  } catch (e) {
    logger.app.error('Error connecting to MongoDB:', e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectMongoDB;