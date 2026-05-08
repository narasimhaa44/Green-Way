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
const axios = require("axios");
const bookingRoutes = require("./routes/booking");
const User = require("./models/User");
const Finder = require("./models/Find");
const Booking = require("./models/Booking");
const Message = require("./models/Message");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://green-way.onrender.com",
    methods: ["GET", "POST"],
  },
});

// ================= MongoDB =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// ================= Middleware =================
app.use(
  cors({
    origin: "https://green-way.onrender.com",
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// ================= EMAIL =================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"GreenWay 🚗" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

// ================= BOOKING =================
app.post("/booking", async (req, res) => {
  const { userEmail, riderEmail, pickup, drop, journeyDate, price } = req.body;

  try {
    if (!userEmail || !riderEmail || !pickup || !drop || !journeyDate || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const rider = await Finder.findOne({ email: riderEmail });
    const user = await User.findOne({ email: userEmail });
    if (new Date(journeyDate) < new Date()) {
      return res.status(400).json({ message: "Cannot book past ride" });
    }
    // ✅ FIX 1
    if (!rider || !user) {
      return res.status(404).json({ message: "User/Rider not found" });
    }

    if (rider.seatsAvailable <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }

    // ✅ FIX 2
    const existing = await Booking.findOne({
      userEmail,
      riderEmail,
      journeyDate,
      status: { $in: ["pending", "confirmed"] }
    });

    if (existing) {
      return res.status(400).json({ message: "Ride already booked" });
    }

    const booking = new Booking({
      userEmail,
      riderEmail,
      pickup,
      drop,
      journeyDate,
      price,
      status: "pending",
    });

    await booking.save();

    await Promise.all([
      sendEmail(
        riderEmail,
        "🚗 New Ride Request",
        `
        <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
          <div style="max-width:500px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
      
            <div style="background:#059669; color:white; padding:16px; text-align:center;">
              <h2 style="margin:0;">New Ride Request 🚗</h2>
            </div>
      
            <div style="padding:20px;">
              <p style="font-size:16px;">Hi <b>${user.name}</b>,</p>
      
              <p style="color:#555;">
                You have received a new ride request from a user.
              </p>
      
              <div style="background:#f9fafb; padding:15px; border-radius:10px; margin:15px 0;">
                <p><b>Route:</b> ${pickup} → ${drop}</p>
                <p><b>Date:</b> ${new Date(journeyDate).toLocaleString()}</p>
                <p><b>Passenger:</b> ${user.name}</p>
              </div>
      
              <p style="color:#555;">
                Please log in to your dashboard to accept or reject the request.
              </p>
      
              <div style="text-align:center; margin-top:20px;">
                <a href="https://green-way.onrender.com"
                   style="background:#059669; color:white; padding:10px 20px; text-decoration:none; border-radius:6px;">
                   View Request
                </a>
              </div>
            </div>
      
            <div style="background:#f1f5f9; padding:10px; text-align:center; font-size:12px; color:#888;">
              Carpool App • Safe & Smart Travel
            </div>
      
          </div>
        </div>
        `
      ),
      sendEmail(
        userEmail,
        "📩 Ride Request Sent",
        `
        <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
          <div style="max-width:500px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
      
            <div style="background:#3b82f6; color:white; padding:16px; text-align:center;">
              <h2 style="margin:0;">Ride Request Sent 🚀</h2>
            </div>
      
            <div style="padding:20px;">
              <p style="font-size:16px;">Hi <b>${user.name}</b>,</p>
      
              <p style="color:#555;">
                Your ride request has been successfully sent to the driver.
              </p>
      
              <div style="background:#f9fafb; padding:15px; border-radius:10px; margin:15px 0;">
                <p><b>Route:</b> ${pickup} → ${drop}</p>
                <p><b>Date:</b> ${new Date(journeyDate).toLocaleString()}</p>
                <p><b>Status:</b> Waiting for driver confirmation ⏳</p>
              </div>
      
              <p style="color:#555;">
                You will be notified once the driver accepts your request.
              </p>
      
              <div style="text-align:center; margin-top:20px;">
                <a href="https://green-way.onrender.com"
                   style="background:#3b82f6; color:white; padding:10px 20px; text-decoration:none; border-radius:6px;">
                   View My Rides
                </a>
              </div>
            </div>
      
            <div style="background:#f1f5f9; padding:10px; text-align:center; font-size:12px; color:#888;">
              Carpool App • Travel smarter together
            </div>
      
          </div>
        </div>
        `
      ),
    ]);

    res.json({ message: "Booking successful", booking });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Booking failed" });
  }
});



app.post("/booking/accept/:id", async (req, res) => {
  const { role } = req.body;

  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).send("Booking not found");

  // ❌ block invalid states
  if (booking.status === "cancelled") {
    return res.status(400).json({ message: "Ride cancelled" });
  }

  if (booking.status === "completed") {
    return res.status(400).json({ message: "Ride completed" });
  }

  // prevent double accept
  if (role === "user" && booking.userAccepted) return res.json(booking);
  if (role === "driver" && booking.driverAccepted) return res.json(booking);

  // mark accept
  if (role === "user") booking.userAccepted = true;
  if (role === "driver") booking.driverAccepted = true;

  // BOTH ACCEPTED
  if (booking.userAccepted && booking.driverAccepted) {

    if (booking.status !== "confirmed") {

      const rider = await Finder.findOneAndUpdate(
        {
          email: booking.riderEmail,
          seatsAvailable: { $gt: 0 }
        },
        { $inc: { seatsAvailable: -1 } },
        { new: true }
      );

      if (!rider) {
        return res.status(400).json({ message: "Seat already taken" });
      }

      booking.status = "confirmed";
    }
  }

  await booking.save();
  res.json(booking);
});

app.post("/booking/cancel/:id", async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) return res.status(404).send("Booking not found");

  // 🔥 if already confirmed → return seat
  if (booking.status === "confirmed") {
    await Finder.findOneAndUpdate(
      { email: booking.riderEmail },
      { $inc: { seatsAvailable: +1 } }
    );
  }

  booking.status = "cancelled";
  await booking.save();

  res.send("Cancelled");
});

app.post("/booking/complete/:id", async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.id, {
    status: "completed",
  });

  res.send("Ride completed");
});

app.get("/my-rides", async (req, res) => {
  console.log("GET /my-rides CALLED");
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const rides = await Booking.find({
      $or: [{ userEmail: email }, { riderEmail: email }],
    }).sort({ journeyDate: 1 });

    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: "Error fetching rides" });
  }
});

// ================= PASSPORT =================
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

// ================= GOOGLE AUTH =================
passport.use(
  "google-finder",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_FINDER_CLIENT_ID,
      clientSecret: process.env.GOOGLE_FINDER_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/google/finder/callback`,
    },
    async (_, __, profile, done) => {
      try {
        let finder = await Finder.findOne({ email: profile.emails[0].value });
        if (!finder) {
          finder = await Finder.create({
            oauthId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            picture: profile.photos[0].value,
          });
        }

        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          await User.create({
            oauthId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            picture: profile.photos[0].value,
          });
        }

        return done(null, finder);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

passport.use(
  "google-user",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_USER_CLIENT_ID,
      clientSecret: process.env.GOOGLE_USER_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/google/user/callback`,
    },
    async (_, __, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = await User.create({
            oauthId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            picture: profile.photos[0].value,
          });
        }

        // Also create in Finder DB to keep in sync
        let finder = await Finder.findOne({ email: profile.emails[0].value });
        if (!finder) {
          await Finder.create({
            oauthId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            picture: profile.photos[0].value,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

// ================= OAUTH ROUTES =================
app.get(
  "/auth/google/finder",
  passport.authenticate("google-finder", { scope: ["profile", "email"] }),
);

app.get(
  "/auth/google/finder/callback",
  passport.authenticate("google-finder", { failureRedirect: "/" }),
  (req, res) => {
    if (!req.user) return res.send("Login failed");

    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-success?email=${req.user.email}&name=${encodeURIComponent(req.user.name)}&picture=${encodeURIComponent(req.user.picture)}`,
    );
  },
);

app.get(
  "/auth/google/user",
  passport.authenticate("google-user", { scope: ["profile", "email"] }),
);

app.get(
  "/auth/google/user/callback",
  passport.authenticate("google-user", { failureRedirect: "/" }),
  (req, res) => {
    if (!req.user) return res.send("Login failed");

    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-success?email=${req.user.email}&name=${encodeURIComponent(req.user.name)}&picture=${encodeURIComponent(req.user.picture)}`,
    );
  },
);
// ================= Manual Signup/Login =================
app.post("/userSignup", async (req, res) => {
  const { userName, email, password } = req.body;
  if (!userName || !email || !password)
    return res.status(400).json({ message: "Missing fields" });
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });
    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      name: userName,
      email,
      password: hashed,
      provider: "manual",
    });
    res.json({ message: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});

app.post("/userlogin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing fields" });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    res.json({
      email: user.email,
      name: user.name,
      picture: user.picture,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

// ================= Finder Signup/Login =================
app.post("/finderSignup", async (req, res) => {
  const { userName, email, password } = req.body;
  if (!userName || !email || !password)
    return res.status(400).json({ message: "Missing fields" });
  try {
    const exists = await Finder.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });
    const hashed = await bcrypt.hash(password, 10);
    await Finder.create({
      name: userName,
      email,
      password: hashed,
      provider: "manual",
    });
    res.json({ message: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});

app.post("/finderlogin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing fields" });
  try {
    const finder = await Finder.findOne({ email });
    if (!finder)
      return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, finder.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: finder._id, email: finder.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    res.json({
      email: finder.email,
      name: finder.name,
      picture: finder.picture,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

// ================= Update Routes =================

app.use((req, res, next) => {
  console.log("👉 Incoming:", req.method, req.url);
  next();
});

app.post("/update", async (req, res) => {
  const { pickup, drop, journeyDate, email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Finder not found" });
    if (pickup !== undefined) user.pickup = pickup;
    if (drop !== undefined) user.drop = drop;
    if (journeyDate !== undefined) user.journeyDate = new Date(journeyDate);
    await user.save();
    res.json({ message: "Finder info updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update finder info" });
  }
});

app.post("/update1", async (req, res) => {
  console.log("🔥 /update1 HIT");
  const {
    pickup,
    drop,
    pickupLat,
    pickupLng,
    dropLat,
    dropLng,
    journeyDate,
    carModel,
    seatsAvailable,
    carNumber,
    email,
    Cost,
  } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });
  try {
    const finder = await Finder.findOne({ email });
    console.log(finder);
    if (!finder) return res.status(404).json({ message: "Finder not found" });
    if (pickup !== undefined) finder.pickup = pickup;
    if (drop !== undefined) finder.drop = drop;
    // 🔥 IMPORTANT
    finder.pickupLocation = { lat: pickupLat, lng: pickupLng };
    finder.dropLocation = { lat: dropLat, lng: dropLng };
    if (journeyDate !== undefined) finder.journeyDate = journeyDate;
    if (carModel !== undefined) finder.carModel = carModel;
    if (seatsAvailable !== undefined)
      finder.seatsAvailable = Number(seatsAvailable);
    if (carNumber !== undefined) finder.carNumber = carNumber;
    if (Cost !== undefined) finder.price = Cost;

    await finder.save();
    res.json({ message: "Finder info updated", finder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update finder info" });
  }
});

// ================= Nearby Riders Route =================
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

app.post("/nearby-riders", async (req, res) => {
  const {
    userLocation,
    userDropLocation,
    radius = 10,
    userJourneyDate,
  } = req.body;

  try {
    const allFinders = await Finder.find({
      pickupLocation: { $exists: true, $ne: null },
      dropLocation: { $exists: true, $ne: null },
      journeyDate: { $exists: true, $ne: null },
    });

    const nearbyRiders = [];
    const currentDate = new Date();

    for (let finder of allFinders) {
      const finderDate = new Date(finder.journeyDate);

      // skip past rides
      if (finderDate.getTime() + 6 * 60 * 60 * 1000 < currentDate.getTime()) {
        console.log("Skipping past ride:", finder.name, finder.journeyDate);
        continue;
      }

      // 🔥 USE STORED COORDS (NO GEOCODE)
      const pickupCoords = finder.pickupLocation;
      const dropCoords = finder.dropLocation;

      if (pickupCoords && dropCoords) {
        const pickupDistance = haversineDistance(
          { lat: userLocation.lat, lng: userLocation.lng },
          pickupCoords,
        );

        const dropDistance = haversineDistance(
          { lat: userDropLocation.lat, lng: userDropLocation.lng },
          dropCoords,
        );

        console.log(
          `Finder: ${finder.name}, PickupDist: ${pickupDistance.toFixed(2)} km, DropDist: ${dropDistance.toFixed(2)} km`,
        );

        if (pickupDistance <= radius && dropDistance <= radius) {
          nearbyRiders.push({
            id: finder._id,
            name: finder.name,
            picture: finder.picture,

            pickupLat: pickupCoords.lat,
            pickupLng: pickupCoords.lng,

            dropLat: dropCoords.lat,
            dropLng: dropCoords.lng,

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
    await sendEmail(
      process.env.EMAIL_USER,
      "✅ Test from Render via Brevo API",
      "<p>GreenWay Brevo API mail system works perfectly 🚀</p>",
    );
    res.send("✅ Email sent successfully using Brevo API!");
  } catch (err) {
    console.error("❌ Test mail failed:", err.message);
    res.status(500).send(err.message);
  }
});

app.get("/message/:bookingId", async (req, res) => {
  try {
    const msgs = await Message.find({
      bookingId: req.params.bookingId,
    }).sort({ createdAt: 1 });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// ================= Socket.IO Logic =================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (bookingId) => {
    socket.join(bookingId);
    console.log("User joined room:", bookingId);
  });

  socket.on("sendMessage", async (data) => {
    try {
      const msg = await Message.create(data);
      io.to(data.bookingId).emit("receiveMessage", msg);
    } catch (err) {
      console.error("Failed to save message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ================= Start Server =================
server.listen(process.env.PORT || 5000, () =>
  console.log("🚀 Server running on port", process.env.PORT || 5000),
);
