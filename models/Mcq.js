const mongoose = require('mongoose');

const McqSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    choices: {
        A: { type: String, required: true },
        B: { type: String, required: true },
        C: { type: String, required: true },
        D: { type: String, required: true }
    },
    correct: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Mcq', McqSchema);