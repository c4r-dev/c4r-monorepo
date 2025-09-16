// import { mongoose } from 'mongoose'
// const MONGODB_URI =
//   'mongodb+srv://c4rdfischer4623:df4623DF!@serverlessaws.onx2ah0.mongodb.net/c4r?retryWrites=true&w=majority&appName=ServerlessAWS'
// const connectMongoDB = async () => {
//   try {
//     await mongoose.connect(MONGODB_URI)
//     console.log('Connected to MongoDB.')
//   } catch (error) {
//     console.log(error)
//   }
// }

// export default connectMongoDB


// File: lib/mongodb.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not defined!');
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

console.log('MongoDB connection string available:', MONGODB_URI ? 'Yes' : 'No');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectMongoDB() {
  if (cached.conn) {
    console.log('Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('Creating new MongoDB connection...');
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch(err => {
        console.error('MongoDB connection error:', err);
        cached.promise = null;
        throw err;
      });
  }
  
  try {
    console.log('Waiting for MongoDB connection...');
    cached.conn = await cached.promise;
    console.log('MongoDB connection established');
  } catch (e) {
    console.error('Error connecting to MongoDB:', e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectMongoDB;