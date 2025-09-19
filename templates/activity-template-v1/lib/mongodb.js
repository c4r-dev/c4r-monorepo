const logger = require('../../../packages/logging/logger.js');
/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI && process.env.NODE_ENV !== 'development') {
  // Only throw error in production if MONGODB_URI is actually needed
  logger.app.warn('MONGODB_URI environment variable is not defined');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
global {
  var mongoose= global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn, promise) {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      // *** MODIFIED LINE BELOW ***
      return mongoose.connection; // Return the connection object, not the entire instance
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;