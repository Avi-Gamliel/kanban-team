const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pageSchema = new Schema({
    page_id: Number,
    custumer_id: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    custumers_share: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    name_board: String,
    name_desc: String,
    max_doing: Number,
    plan: JSON,
    todo: JSON,
    doing: JSON,
    done: JSON,

}, {
    timestamps: true,
});

module.exports = mongoose.model('Page', pageSchema);