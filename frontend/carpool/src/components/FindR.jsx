import React, { useState, useEffect } from "react";
import styles from "./FindR.module.css";
import { MdMyLocation } from "react-icons/md";
import { GoLocation } from "react-icons/go";
import { Navigation } from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const FindR = () => {
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [journeyDate, setJourneyDate] = useState(""); // ⬅️ NEW STATE
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [pickupInput, setPickupInput] = useState("");
  const [dropInput, setDropInput] = useState("");
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
  const fetchSuggestions = async (query, type) => {
    if (query.length < 2) return;

    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`
      );

      const data = await res.json();

      const formatted = data.features.map((item) => ({
        place_id: item.properties.osm_id,
        display_name: [
          item.properties.name,
          item.properties.city,
          item.properties.state,
          item.properties.country
        ].filter(Boolean).join(", "),
        lat: item.geometry.coordinates[1],
        lon: item.geometry.coordinates[0],
      }));

      if (type === "pickup") {
        setPickupSuggestions(formatted);
      } else {
        setDropSuggestions(formatted);
      }
    } catch (err) {
      console.error("Photon API error:", err);
    }
  };

  const handleSelect = (item, type) => {
    const locationData = {
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    };
    if (type === "pickup") {
      setPickup(locationData);
      setPickupInput(locationData.name);
      setPickupSuggestions([]);
    } else {
      setDrop(locationData);
      setDropInput(locationData.name);
      setDropSuggestions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const email = user?.email;

      if (!email) {
        alert("User not logged in");
        navigate("/login");
        return;
      }

      await axios.post("https://green-wayb.onrender.com/update", {
        pickup: pickup?.name,
        drop: drop?.name,
        journeyDate,
        email,
      });

      navigate("/Finding", { state: { pickup, drop, journeyDate, email } });

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
                value={pickupInput}
                onChange={(e) => { setPickupInput(e.target.value); fetchSuggestions(e.target.value, "pickup"); }}
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
                value={dropInput}
                onChange={(e) => { setDropInput(e.target.value); fetchSuggestions(e.target.value, "drop"); }}
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
