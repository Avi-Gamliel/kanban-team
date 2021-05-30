const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    shortName: String,
    email: String,
    password: String,
    payment: Boolean,
    pages: [{ type: Schema.Types.ObjectId, ref: 'Page' }],
    pages_share: [{ type: Schema.Types.ObjectId, ref: 'Page' }],
    notification: [],
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);