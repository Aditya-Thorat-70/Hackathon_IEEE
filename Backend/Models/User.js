const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ['doctor', 'patient'], required: true }
});

module.exports = mongoose.models.User|| mongoose.model('User', userSchema);
