require("dotenv").config();
const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const fetch = require("node-fetch");
const User = require("./models/User");
const Finder = require("./models/Find");

const app = express();
app.use(express.json());

// ================= MongoDB =================
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ================= CORS =================
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET","POST","PUT","DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ================= Session =================
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
// ================= BOOKING & EMAIL NOTIFICATION =================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) console.error("❌ Email transporter error:", error);
  else console.log("✅ Nodemailer ready to send emails");
});

// ================= BOOKING ROUTE =================
app.post("/booking", async (req, res) => {
  const { userEmail, riderEmail, pickup, drop, journeyDate } = req.body;

  if (!userEmail || !riderEmail || !pickup || !drop || !journeyDate)
    return res.status(400).json({ message: "Missing required booking details" });

  try {
    const rider = await Finder.findOne({ email: riderEmail });
    const user = await User.findOne({ email: userEmail });

    if (!rider) return res.status(404).json({ message: "Rider not found" });
    if (!user) return res.status(404).json({ message: "User not found" });

    const formattedDate = new Date(journeyDate).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    // ========= Rider Email =========
    const riderMail = {
      from: `"GreenWay" <${process.env.EMAIL_USER}>`,
      to: riderEmail,
      subject: `🚘 New Booking Request from ${user.name || "User"}`,
      html: `
        <div style="font-family: Arial; background: #f7f7f7; padding: 20px;">
          <div style="max-width:600px; margin:auto; background:#fff; border-radius:10px; padding:20px;">
            <h2>Hi ${rider.name || "Rider"},</h2>
            <p>You have received a new ride request through <b>GreenWay</b>.</p>
            <p><b>Passenger:</b> ${user.name} (${user.email})</p>
            <p><b>Pickup:</b> ${pickup}</p>
            <p><b>Drop:</b> ${drop}</p>
            <p><b>Journey Date:</b> ${formattedDate}</p>
            <hr/>
            <p style="font-size:14px;color:#555;">📞 Contact the passenger directly to confirm.</p>
            <p style="font-size:13px;color:#777;">— GreenWay Team 🚗</p>
          </div>
        </div>`,
    };

    // ========= User Email =========
    const userMail = {
      from: `"GreenWay" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "✅ Your Ride Booking Confirmation",
      html: `
        <div style="font-family: Arial; background: #f7f7f7; padding: 20px;">
          <div style="max-width:600px; margin:auto; background:#fff; border-radius:10px; padding:20px;">
            <h2>Hi ${user.name || "User"},</h2>
            <p>Your ride has been successfully booked!</p>
            <p><b>Driver:</b> ${rider.name} (${rider.email})</p>
            <p><b>Pickup:</b> ${pickup}</p>
            <p><b>Drop:</b> ${drop}</p>
            <p><b>Date:</b> ${formattedDate}</p>
            <hr/>
            <p style="font-size:14px;color:#555;">🚗 Have a safe and pleasant journey!</p>
            <p style="font-size:13px;color:#777;">— GreenWay Team 🌱</p>
          </div>
        </div>`,
    };

    await Promise.all([transporter.sendMail(riderMail), transporter.sendMail(userMail)]);
    console.log(`📩 Booking emails sent to ${riderEmail} and ${userEmail}`);

    res.json({
      message: "Booking confirmed and emails sent successfully",
      rider: riderEmail,
      user: userEmail,
    });
  } catch (err) {
    console.error("❌ Booking email failed:", err);
    res.status(500).json({ message: "Failed to process booking" });
  }
});

// ================= PASSPORT SETUP =================
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, { id: user.id, model: user instanceof User ? "User" : "Finder" });
});

passport.deserializeUser(async (data, done) => {
  try {
    const model = data.model === "User" ? User : Finder;
    const user = await model.findById(data.id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ================= GOOGLE OAUTH =================
passport.use(
  "google-finder",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_FINDER_CLIENT_ID,
      clientSecret: process.env.GOOGLE_FINDER_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/google/finder/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let finder = await Finder.findOne({ email: profile.emails[0].value });
        if (!finder) {
          finder = await Finder.create({
            oauthId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            picture: profile.photos[0].value,
            provider: "google-finder",
          });
        }
        done(null, finder);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.use(
  "google-user",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_USER_CLIENT_ID,
      clientSecret: process.env.GOOGLE_USER_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/google/user/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = await User.create({
            oauthId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            picture: profile.photos[0].value,
            provider: "google-user",
          });
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);


// ================= Passport =================
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, { id: user.id, model: user instanceof User ? "User" : "Finder" });
});

passport.deserializeUser(async (data, done) => {
  try {
    const model = data.model === "User" ? User : Finder;
    const user = await model.findById(data.id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ================= Google OAuth =================
passport.use("google-finder", new GoogleStrategy({
  clientID: process.env.GOOGLE_FINDER_CLIENT_ID,
  clientSecret: process.env.GOOGLE_FINDER_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/auth/google/finder/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let finder = await Finder.findOne({ email: profile.emails[0].value });
    if (!finder) {
      finder = await Finder.create({
        oauthId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        picture: profile.photos[0].value,
        provider: "google-finder",
      });
    }
    done(null, finder);
  } catch (err) {
    done(err, null);
  }
}));

passport.use("google-user", new GoogleStrategy({
  clientID: process.env.GOOGLE_USER_CLIENT_ID,
  clientSecret: process.env.GOOGLE_USER_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/auth/google/user/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      user = await User.create({
        oauthId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        picture: profile.photos[0].value,
        provider: "google-user",
      });
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// ================= OAuth Routes =================
app.get("/auth/google/finder", passport.authenticate("google-finder", { scope: ["profile","email"], prompt:"select_account" }));
app.get("/auth/google/finder/callback",
  passport.authenticate("google-finder", { failureRedirect: "/" }),
  (req,res) => {
    res.redirect(`${process.env.FRONTEND_URL}/from?email=${encodeURIComponent(req.user.email)}`);
  }
);

app.get("/auth/google/user", passport.authenticate("google-user", { scope:["profile","email"], prompt:"select_account" }));
app.get("/auth/google/user/callback",
  passport.authenticate("google-user", { failureRedirect:"/" }),
  (req,res) => {
    res.redirect(`${process.env.FRONTEND_URL}/findR?email=${encodeURIComponent(req.user.email)}`);
  }
);

// ================= Manual Signup/Login =================
app.post("/userSignup", async (req,res)=>{
  const { userName, email, password } = req.body;
  if(!userName || !email || !password) return res.status(400).json({ message:"Missing fields" });
  try{
    const exists = await User.findOne({ email });
    if(exists) return res.status(400).json({ message:"User already exists" });
    const hashed = await bcrypt.hash(password,10);
    await User.create({ name:userName, email, password:hashed, provider:"manual" });
    res.json({ message:"Signup successful" });
  } catch(err){ console.error(err); res.status(500).json({ message:"Signup failed" }); }
});

app.post("/userlogin", async(req,res)=>{
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ message:"Missing fields" });
  try{
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ message:"Invalid credentials" });
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch) return res.status(400).json({ message:"Invalid credentials" });
    const token = jwt.sign({ id:user._id, email:user.email }, process.env.JWT_SECRET, { expiresIn:"1h" });
    res.json({ email:user.email, token });
  } catch(err){ console.error(err); res.status(500).json({ message:"Login failed" }); }
});

// ================= Finder Signup/Login =================
app.post("/finderSignup", async(req,res)=>{
  const { userName, email, password } = req.body;
  if(!userName || !email || !password) return res.status(400).json({ message:"Missing fields" });
  try{
    const exists = await Finder.findOne({ email });
    if(exists) return res.status(400).json({ message:"User already exists" });
    const hashed = await bcrypt.hash(password,10);
    await Finder.create({ name:userName, email, password:hashed, provider:"manual" });
    res.json({ message:"Signup successful" });
  } catch(err){ console.error(err); res.status(500).json({ message:"Signup failed" }); }
});

app.post("/finderlogin", async(req,res)=>{
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ message:"Missing fields" });
  try{
    const finder = await Finder.findOne({ email });
    if(!finder) return res.status(400).json({ message:"Invalid credentials" });
    const isMatch = await bcrypt.compare(password,finder.password);
    if(!isMatch) return res.status(400).json({ message:"Invalid credentials" });
    const token = jwt.sign({ id:finder._id, email:finder.email }, process.env.JWT_SECRET, { expiresIn:"1h" });
    res.json({ email:finder.email, token });
  } catch(err){ console.error(err); res.status(500).json({ message:"Login failed" }); }
});

// ================= Update Routes =================
app.post("/update", async(req,res)=>{
  const { pickup, drop, journeyDate, email } = req.body;
  if(!email) return res.status(400).json({ message:"Email is required" });
  try{
    const finder = await Finder.findOne({ email });
    if(!finder) return res.status(404).json({ message:"Finder not found" });
    if(pickup!==undefined) finder.pickup = pickup;
    if(drop!==undefined) finder.drop = drop;
    if(journeyDate!==undefined) finder.journeyDate = new Date(journeyDate);
    await finder.save();
    res.json({ message:"Finder info updated successfully", finder });
  } catch(err){ console.error(err); res.status(500).json({ message:"Failed to update finder info" }); }
});

app.post("/update1", async(req,res)=>{
  const { pickup, drop, journeyDate, carModel, seatsAvailable, carNumber, email, Cost } = req.body;
  if(!email) return res.status(400).json({ message:"Email required" });
  try{
    const finder = await Finder.findOne({ email });
    if(!finder) return res.status(404).json({ message:"Finder not found" });
    if(pickup!==undefined) finder.pickup=pickup;
    if(drop!==undefined) finder.drop=drop;
    if(journeyDate!==undefined) finder.journeyDate=journeyDate;
    if(carModel!==undefined) finder.carModel=carModel;
    if(seatsAvailable!==undefined) finder.seatsAvailable=Number(seatsAvailable);
    if(carNumber!==undefined) finder.carNumber=carNumber;
    if(Cost!==undefined) finder.price=Cost;
    await finder.save();
    res.json({ message:"Finder info updated", finder });
  } catch(err){ console.error(err); res.status(500).json({ message:"Failed to update finder info" }); }
});

// ================= Nearby Riders Route =================
// ================= Nearby Riders Route =================
const axios = require("axios");

const haversineDistance = (coord1, coord2) => {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371; // radius of Earth in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const geocode = async (place) => {
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { format: "json", q: place, limit: 1 },
      headers: { "User-Agent": "GreenWay/1.0 (support@greenway.com)" } // required
    });

    if (res.data.length > 0) {
      return [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
    }
    return null;
  } catch (err) {
    console.error("❌ Geocoding failed for:", place, err.message);
    return null;
  }
};

app.post("/nearby-riders", async (req, res) => {
  const { userLocation, userDropLocation, radius = 5, userJourneyDate } = req.body;

  try {
    const allFinders = await Finder.find({
      pickup: { $exists: true, $ne: "" },
      drop: { $exists: true, $ne: "" },
      journeyDate: { $exists: true, $ne: null },
    });

    const nearbyRiders = [];
    const currentDate = new Date();

    for (let finder of allFinders) {
      const finderDate = new Date(finder.journeyDate);

      // 🚫 skip past rides (only allow today or future)
      if (finderDate.getTime() + 6 * 60 * 60 * 1000 < currentDate.getTime()) {
        console.log("Skipping past ride:", finder.name, finder.journeyDate);
        continue;
      }

      const pickupCoords = await geocode(finder.pickup);
      const dropCoords = await geocode(finder.drop);

      if (pickupCoords && dropCoords) {
        const pickupDistance = haversineDistance(
          { lat: userLocation.lat, lng: userLocation.lng },
          { lat: pickupCoords[0], lng: pickupCoords[1] }
        );
        const dropDistance = haversineDistance(
          { lat: userDropLocation.lat, lng: userDropLocation.lng },
          { lat: dropCoords[0], lng: dropCoords[1] }
        );

        console.log(
          `Finder: ${finder.name}, PickupDist: ${pickupDistance.toFixed(2)} km, DropDist: ${dropDistance.toFixed(2)} km`
        );

        // ✅ if both within range, add to list
        if (pickupDistance <= radius && dropDistance <= radius) {
          nearbyRiders.push({
            id: finder._id,
            name: finder.name,
            picture: finder.picture,
            pickupLat: pickupCoords[0],
            pickupLng: pickupCoords[1],
            dropLat: dropCoords[0],
            dropLng: dropCoords[1],
            pickup: finder.pickup,
            drop: finder.drop,
            carModel: finder.carModel,
            seats: finder.seatsAvailable,
            carnumber: finder.carNumber,
            price: finder.price,
            email: finder.email,
            journeyDate: finder.journeyDate,
          });
        }
      }
    }

    console.log(`✅ Found ${nearbyRiders.length} nearby riders`);
    res.json({ riders: nearbyRiders });
  } catch (err) {
    console.error("❌ /nearby-riders failed:", err);
    res.status(500).json({ message: "Failed to get nearby riders" });
  }
});

app.get("/test-mail", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "✅ Test from Render",
      text: "GreenWay mail system works!",
    });
    res.send("✅ Email sent successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// ================= Start Server =================
app.listen(process.env.PORT || 5000, ()=>console.log("🚀 Server running on port", process.env.PORT||5000));
