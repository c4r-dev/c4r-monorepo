require('dotenv').config();
const logger = require('../../../../../packages/logging/logger.js');
import { mongoose } from 'mongoose'
const MONGODB_URI = process.env.MONGODB_URI
const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    logger.app.info('Connected to MongoDB.')
  } catch (error) {
    logger.app.info(error)
  }
}

export default connectMongoDB
