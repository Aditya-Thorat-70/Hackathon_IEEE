const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI,{});
        console.log('MongoDB connected');
    } catch (error) {
        console.error('DB Connection Failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
