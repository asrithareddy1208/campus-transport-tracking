
const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
    busNumber: {
        type: String,
        required: true,
        unique: true
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Maintenance"],
        default: "Active"
    },
    startPoint: {
        type: String,
        default: ""
    },
    destination: {
        type: String,
        default: ""
    },
    stops: [{
        stopName: {
            type: String,
            required: true
        },
        arrivalTime: {
            type: String,
            required: true
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model("Bus", busSchema);
