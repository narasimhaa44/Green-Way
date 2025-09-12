const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  oauthId: { type: String,default:"" },
  name: String,
    provider: { type: String, default: "manual" },
  email: { type: String, required: true, unique: true },
  picture: String,
  provider: String,
  lastLogin: { type: Date, default: Date.now },
  pickup: { type: String, default: "" },
  drop: { type: String, default: "" },
  date: { type: Date, default: Date.now },
      password:{type:String,default:""},
});

module.exports = mongoose.model("User", userSchema);
