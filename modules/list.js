const mongoose = require('mongoose');
const Row = require('./row')


const listsSchema = mongoose.Schema({
    title: String,
    rows: [Row]
}, {
    timestamps: true,
});
module.exports = mongoose.model('List', listsSchema);