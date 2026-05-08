const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    userEmail: String,
    riderEmail: String,

    pickup: String,
    drop: String,

    pickupLocation: {
        lat: Number,
        lng: Number
    },

    dropLocation: {
        lat: Number,
        lng: Number
    },

    journeyDate: Date,
    price: Number,
    driverAccepted: { type: Boolean, default: false },
    userAccepted: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ["pending", "confirmed", "completed", "cancelled"],
        default: "pending"
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", bookingSchema);