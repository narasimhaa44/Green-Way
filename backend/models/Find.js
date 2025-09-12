const mongoose = require("mongoose");

const FinderSchema = new mongoose.Schema({
    oauthId: { type: String },
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    picture: { type: String, default: "" },
    provider: { type: String, default: "" },
    lastLogin: { type: Date, default: Date.now },

    // Journey Info
    pickup: { type: String, default: "" },
    drop: { type: String, default: "" },
    journeyDate: { type: Date },        // Updated from 'date' to reflect the journey
    price:{type:String,defualt:""},
    // Additional fields from the form
    carModel: { type: String, default: "" },
    seatsAvailable: { type: Number, default: 1 },
    carNumber: { type: String, default: "" },
    password: { type: String, default: "" },
});

module.exports = mongoose.model("Finder", FinderSchema);
