import styles from "./From.module.css";
import React, { useState, useEffect } from "react";
import { MdMyLocation } from "react-icons/md";
import { GoLocation } from "react-icons/go";
import { Navigation } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoCalendarClearOutline } from "react-icons/io5";
import { LuCar } from "react-icons/lu";
import { IoPeople } from "react-icons/io5";
import { MdCurrencyRupee } from "react-icons/md";
const From = () => {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [journeyDate, setJourneyDate] = useState("");
  const [carModel, setCarModel] = useState("");
  const [seatsAvailable, setSeatsAvailable] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [Cost,setCost]=useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pickup.length >= 2) fetchSuggestions(pickup, "pickup");
      else setPickupSuggestions([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [pickup]);

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
    if (emailFromUrl) localStorage.setItem("userEmail", emailFromUrl);
    else {
      axios.get("http://localhost:5000/me", { withCredentials: true })
        .then((res) => {
          if (res.data.email) localStorage.setItem("userEmail", res.data.email);
        })
        .catch((err) => console.warn("No active session:", err.response?.data || err.message));
    }
  }, []);

  const fetchSuggestions = async (query, type) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      type === "pickup" ? setPickupSuggestions(data) : setDropSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleSelect = (item, type) => {
    type === "pickup" ? setPickup(item.display_name) : setDrop(item.display_name);
    type === "pickup" ? setPickupSuggestions([]) : setDropSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem("userEmail");

    try {
      const response = await axios.post("http://localhost:5000/update1", {
        pickup,
        drop,
        journeyDate,
        carModel,
        seatsAvailable,
        carNumber,
        email,
        Cost
      });

      console.log("Response:", response.data);
      navigate("/Riding", {
        state: { email,pickup, drop, journeyDate, carModel, seatsAvailable, carNumber,Cost },
      });
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  return (
    <div className={styles.outer}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.cardheader}>
            <div className={styles.cardicon}><Navigation size={28} /></div>
            <h2>Find Your Route</h2>
            <p>Enter your journey details</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label}><GoLocation className={styles.icon} /> Your Location</label>
              <input type="text" value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Enter your location" className={styles.input} />
              {pickupSuggestions.length > 0 && (
                <ul className={styles.suggestions}>
                  {pickupSuggestions.map((item) => (
                    <li key={item.place_id} onClick={() => handleSelect(item, "pickup")}>
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}><MdMyLocation className={styles.icon} /> Your Destination</label>
              <input type="text" value={drop} onChange={(e) => setDrop(e.target.value)} placeholder="Enter drop location" className={styles.input} />
              {dropSuggestions.length > 0 && (
                <ul className={styles.suggestions}>
                  {dropSuggestions.map((item) => (
                    <li key={item.place_id} onClick={() => handleSelect(item, "drop")}>
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}><IoCalendarClearOutline className={styles.icon} /> Journey Date</label>
              <input type="datetime-local" className={styles.input} value={journeyDate} onChange={(e) => setJourneyDate(e.target.value)} min={new Date().toISOString().slice(0, 16)} />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}><LuCar className={styles.icon} /> Car Model</label>
              <input type="text" className={styles.input} value={carModel} placeholder="Enter Your Car Model" onChange={(e) => setCarModel(e.target.value)} />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}><IoPeople className={styles.icon} /> Available Seats</label>
              <input type="number" className={styles.input} value={seatsAvailable} placeholder="Enter Number of Seats" onChange={(e) => setSeatsAvailable(e.target.value)} min="1" />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Car Number</label>
              <input type="text" className={styles.input} value={carNumber} placeholder="Enter Your Car Number" onChange={(e) => setCarNumber(e.target.value)} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Price(<MdCurrencyRupee  className={styles.icon} />)</label>
              <input type="text" className={styles.input} value={Cost} placeholder="Enter Your Car Number" onChange={(e) => setCost(e.target.value)} />
            </div>

            <button type="submit" className={styles.button}>Find Route</button>
          </form>
        </div>

        <div className={styles.right}>
          <img src="/from.jpg"  alt="Find Route" className={styles.find} />
        </div>
      </div>
    </div>
  );
};

export default From;
