const mongoose = require('mongoose');

const titleSchema = mongoose.Schema({
    text: String,
}, {
    timestamps: true,
});

module.exports = mongoose.model('Title', titleSchema);