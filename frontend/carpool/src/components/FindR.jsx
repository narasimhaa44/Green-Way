// Find.js
import React, { useState, useEffect } from "react";
import styles from "./FindR.module.css";
import { MdMyLocation } from "react-icons/md";
import { GoLocation } from "react-icons/go";
import { Navigation } from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const FindR = () => {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [journeyDate, setJourneyDate] = useState(""); // ⬅️ NEW STATE
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const navigate = useNavigate();

  // Fetch suggestions for pickup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pickup.length >= 2) fetchSuggestions(pickup, "pickup");
      else setPickupSuggestions([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [pickup]);

  // Fetch suggestions for drop
  useEffect(() => {
    const timer = setTimeout(() => {
      if (drop.length >= 2) fetchSuggestions(drop, "drop");
      else setDropSuggestions([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [drop]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get("email");
    if (emailFromUrl) {
      localStorage.setItem("userEmail", emailFromUrl);
    } else {
      axios
        .get("http://localhost:5000/me", { withCredentials: true })
        .then((res) => {
          if (res.data.email) {
            localStorage.setItem("userEmail", res.data.email);
          }
        })
        .catch((err) => {
          console.warn("❌ No active session:", err.response?.data || err.message);
        });
    }
  }, []);

  // API call to OpenStreetMap
  const fetchSuggestions = async (query, type) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&addressdetails=1&limit=5`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      type === "pickup"
        ? setPickupSuggestions(data)
        : setDropSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  // Handle suggestion select
  const handleSelect = (item, type) => {
    if (type === "pickup") {
      setPickup(item.display_name);
      setPickupSuggestions([]);
    } else {
      setDrop(item.display_name);
      setDropSuggestions([]);
    }
  };

  // Submit pickup/drop/date to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const email = localStorage.getItem("userEmail"); // ⬅️ stored earlier

      const response = await axios.post("http://localhost:5000/update", {
        pickup,
        drop,
        journeyDate, // ⬅️ send date also
        email,
      });

      console.log("Response from backend:", response.data);
navigate("/Finding", { state: { pickup, drop, journeyDate } });
      navigate("/Finding", {state: { pickup, drop, journeyDate,email }});
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  return (
    <div className={styles.outer}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.cardheader}>
            <div className={styles.cardicon}>
              <Navigation size={28} />
            </div>
            <h2>Find Your Route</h2>
            <p>Enter your journey details</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Pickup */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <GoLocation className={styles.icon} />
                <span>Your Location</span>
              </label>
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Enter your location"
                className={styles.input}
              />
              {pickupSuggestions.length > 0 && (
                <ul className={styles.suggestions}>
                  {pickupSuggestions.map((item) => (
                    <li
                      key={item.place_id}
                      onClick={() => handleSelect(item, "pickup")}
                    >
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Drop */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <MdMyLocation className={styles.icon} />
                <span>Your Destination</span>
              </label>
              <input
                type="text"
                value={drop}
                onChange={(e) => setDrop(e.target.value)}
                placeholder="Enter drop location"
                className={styles.input}
              />
              {dropSuggestions.length > 0 && (
                <ul className={styles.suggestions}>
                  {dropSuggestions.map((item) => (
                    <li
                      key={item.place_id}
                      onClick={() => handleSelect(item, "drop")}
                    >
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Date */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <span>Journey Date</span>
              </label>
              <input
                type="date"
                className={styles.input}
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)} // ⬅️ update state
                min={new Date().toISOString().split("T")[0]} // disable past dates
              />
            </div>

            <button type="submit" className={styles.button}>
              Find Route
            </button>
          </form>
        </div>

        {/* Right image */}
        <div className={styles.right}>
          <img src="/from.jpg" alt="Find Route" className={styles.find} />
        </div>
      </div>
    </div>
  );
};

export default FindR;
