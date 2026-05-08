// const express = require("express");
// const router = express.Router();
// const Booking = require("../models/Booking");

// router.post("/booking", async (req, res) => {
//     try {
//         const {
//             userEmail,
//             riderEmail,
//             pickup,
//             drop,
//             journeyDate
//         } = req.body;

//         // 1️⃣ Save booking
//         const booking = new Booking({
//             userEmail,
//             riderEmail,
//             pickup,
//             drop,
//             journeyDate
//         });

//         await booking.save();

//         // 2️⃣ (Optional later) Send email here

//         res.status(200).json({
//             message: "Booking successful",
//             booking
//         });

//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ error: "Booking failed" });
//     }
// });
// router.get("/my-rides", async (req, res) => {
//     try {
//         const { email } = req.query;

//         const rides = await Booking.find({
//             $or: [
//                 { userEmail: email },
//                 { riderEmail: email }
//             ]
//         }).sort({ journeyDate: -1 });

//         res.json(rides);

//     } catch (err) {
//         res.status(500).json({ error: "Error fetching rides" });
//     }
// });
// module.exports = router;
const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

router.post("/booking", async (req, res) => {
    try {
        const { userEmail, riderEmail, pickup, drop, journeyDate } = req.body;

        if (!userEmail || !riderEmail || !pickup || !drop || !journeyDate) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existing = await Booking.findOne({
            userEmail,
            riderEmail,
            journeyDate,
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
            status: "pending",
        });

        await booking.save();

        res.status(200).json({
            message: "Booking successful",
            booking,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Booking failed" });
    }
});

router.get("/my-rides", async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const rides = await Booking.find({
            $or: [{ userEmail: email }, { riderEmail: email }],
        }).sort({ journeyDate: -1 });

        res.json(rides);
    } catch (err) {
        res.status(500).json({ message: "Error fetching rides" });
    }
});

module.exports = router;