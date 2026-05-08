const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    picture: String,
    password: String,

    roles: {
      type: [String],
      default: ["user"]
    },

    pickup: String,
    drop: String,
    journeyDate: Date,

    pickupLocation: {
      lat: Number,
      lng: Number
    },

    dropLocation: {
      lat: Number,
      lng: Number
    },

    carModel: String,
    seatsAvailable: Number,
    carNumber: String,
    price: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);