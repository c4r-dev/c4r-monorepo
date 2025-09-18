const logger = require('../../../../../../packages/logging/logger.js');
import { mongoose } from "mongoose";

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.app.info("Connected to MongoDB.");
  } catch (error) {
    logger.app.info(error);
  }
};

export default connectMongoDB;