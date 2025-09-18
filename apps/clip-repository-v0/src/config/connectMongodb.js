const logger = require('../../../../packages/logging/logger.js');
import mongoose from 'mongoose';
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.app.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.app.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
export default connectDB;
