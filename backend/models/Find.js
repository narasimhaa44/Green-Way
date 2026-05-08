const mongoose = require("mongoose");

const FinderSchema = new mongoose.Schema({
    oauthId: { type: String },
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    picture: { type: String, default: "" },
    provider: { type: String, default: "" },
    lastLogin: { type: Date, default: Date.now },

    pickup: { type: String, default: "" },
    drop: { type: String, default: "" },

    // 🔥 ADD THIS (VERY IMPORTANT)
    pickupLocation: {
        lat: Number,
        lng: Number
    },
    dropLocation: {
        lat: Number,
        lng: Number
    },

    journeyDate: { type: Date },

    price: { type: String, default: "" },
    carModel: { type: String, default: "" },
    seatsAvailable: { type: Number, default: 1 },
    carNumber: { type: String, default: "" },
    password: { type: String, default: "" },
});

module.exports = mongoose.model("Finder", FinderSchema);