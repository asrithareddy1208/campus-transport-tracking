
const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    alternativeBus: {
        type: String,
        default: ""
    },
    priority: {
        type: String,
        enum: ["Normal", "Important", "Urgent"],
        default: "Normal"
    }
}, { timestamps: true });

module.exports = mongoose.model("Notice", noticeSchema);
