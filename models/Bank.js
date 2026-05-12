const mongoose = require('mongoose');
const User = require('./User');

const BankSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // accountNumber: { type: String, required: true, unique: true },
    // accountHolder: { type: String, required: true },
    balance: { type: Number, default: 0 }
});

module.exports = mongoose.model('Bank', BankSchema);