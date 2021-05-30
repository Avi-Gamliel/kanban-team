const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    costumer_id: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    page_id: [{ type: Schema.Types.ObjectId, ref: 'Page' }],
    task_Id: Number,
    title: String,
    data: JSON
}, {
    timestamps: true,
});
module.exports = mongoose.model('Tasks', taskSchema);