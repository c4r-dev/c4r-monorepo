const logger = require('../../../../packages/logging/logger.js');
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import connectMongoDB from '@/config/connectMongodb.js';
const protect = async (req) => {
    let token = req.headers.get('authorization').split(' ')[1]
    if (
        token
        ) {
        await connectMongoDB();
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await User.findById(decoded.id).select('-password')
            return true
        } catch (error) {
            // logger.app.info(req.user)
            return false
        }
    }

    else {
        return false
    }
}
const admin = (req) => {
    if (req.user && req.user.permission === 'admin') {
        return true
    } else {
        return false
    }
}
export {
    protect,
    admin
}