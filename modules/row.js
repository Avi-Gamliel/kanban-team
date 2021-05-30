const mongoose = require('mongoose');

const rowSchema = mongoose.Schema({
    text: String,
    cheked: Boolean
}, {
    timestamps: true,
});



module.exports = mongoose.model('Row', rowSchema);