import styles from "./Finding.module.css";
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MdCurrencyRupee } from "react-icons/md";
import axios from "axios";

const Finding = () => {
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [nearbyRiders, setNearbyRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  const location = useLocation();
  const { pickup, drop, journeyDate, email } = location.state || {};

  // === Booking Function ===
  const handleBooking = async (rider) => {
    try {
      const res = await axios.post("https://green-wayb.onrender.com/booking", {
        userEmail: email,
        riderEmail: rider.email,
        pickup,
        drop,
        journeyDate,
      });
      console.log("✅ Booking response:", res.data);
      navigate("/SucessU");
    } catch (error) {
      console.error("❌ Booking failed:", error);
      alert("Booking failed. Try again.");
    }
  };

  // === Geocoding Function ===
  const geocode = async (place) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`
      );
      const data = await res.json();
      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      return null;
    } catch (err) {
      console.error("Geocoding error:", err);
      return null;
    }
  };

  // === Fetch Pickup & Drop Coordinates ===
  useEffect(() => {
    const fetchCoords = async () => {
      if (pickup) {
        const coords = await geocode(pickup);
        setPickupCoords(coords);
      }
      if (drop) {
        const coords = await geocode(drop);
        setDropCoords(coords);
      }
    };
    fetchCoords();
  }, [pickup, drop]);

  // === Fetch Nearby Riders & Setup Map ===
  useEffect(() => {
    const fetchNearbyRiders = async (pickupCoords) => {
      try {
        const res = await axios.post("https://green-wayb.onrender.com/nearby-riders", {
          userLocation: { lat: pickupCoords[0], lng: pickupCoords[1] },
          userDropLocation: { lat: dropCoords[0], lng: dropCoords[1] },
          radius: 5,
          userJourneyDate: journeyDate,
        });

        console.log("Nearby riders response:", res.data);
        return res.data.riders || [];
      } catch (err) {
        console.error("Error fetching nearby riders:", err);
        return [];
      }
    };

    const setupMap = async () => {
      if (!pickupCoords || !dropCoords || !mapContainerRef.current) return;

      // Prevent multiple map instances
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Initialize map
      mapRef.current = L.map(mapContainerRef.current).setView(pickupCoords, 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "GreenWay",
      }).addTo(mapRef.current);

      // Pickup Marker
      L.marker(pickupCoords, {
        icon: L.icon({
          iconUrl: "/finder.png",
          iconSize: [60, 60],
          iconAnchor: [30, 60],
        }),
      })
        .addTo(mapRef.current)
        .bindPopup("Pickup Point");

      // Drop Marker
      L.marker(dropCoords, {
        icon: L.icon({
          iconUrl: "/dest.png",
          iconSize: [40, 50],
          iconAnchor: [20, 50],
        }),
      })
        .addTo(mapRef.current)
        .bindPopup("Destination");

      // Curved Route Line
      const midLat = (pickupCoords[0] + dropCoords[0]) / 2;
      const midLng = (pickupCoords[1] + dropCoords[1]) / 2;
      const offsetLat = (dropCoords[0] - pickupCoords[0]) * 0.3;
      const offsetLng = (dropCoords[1] - pickupCoords[1]) * 0.3;
      const curvePoint = [midLat + offsetLng, midLng - offsetLat];

      const curvePoints = [];
      for (let t = 0; t <= 1; t += 0.05) {
        const lat =
          (1 - t) * (1 - t) * pickupCoords[0] +
          2 * (1 - t) * t * curvePoint[0] +
          t * t * dropCoords[0];
        const lng =
          (1 - t) * (1 - t) * pickupCoords[1] +
          2 * (1 - t) * t * curvePoint[1] +
          t * t * dropCoords[1];
        curvePoints.push([lat, lng]);
      }

      L.polyline(curvePoints, {
        color: "#444141ff",
        weight: 2,
        opacity: 1.0,
        smoothFactor: 1,
        className: styles.animatedLine,
      }).addTo(mapRef.current);

      // Fetch and add nearby riders
      const riders = await fetchNearbyRiders(pickupCoords);
      setNearbyRiders(riders);
      setLoading(false);

      if (riders.length === 0) {
        console.log("⚠️ No riders found nearby");
      } else {
        riders.forEach((rider) => {
          L.marker([rider.pickupLat, rider.pickupLng], {
            icon: L.icon({
              iconUrl: "/rider1.png",
              iconSize: [70, 70],
              iconAnchor: [35, 70],
            }),
          })
            .addTo(mapRef.current)
            .bindPopup(rider.name);
        });
      }

      const bounds = L.latLngBounds([pickupCoords, dropCoords]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    };

    setupMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [pickupCoords, dropCoords, journeyDate]);

  // === UI Render ===
  return (
    <div className={styles.main}>
      <div className={styles.left}>
        <div className={styles.mapHeader}>
          <h2 className={styles.heading}>Live Location Tracking</h2>
          <div className={styles.statusContainer}>
            <div className={styles.statusIndicator}>
              <div className={styles.pulse}></div>
            </div>
            <span className={styles.statusText}>Live</span>
          </div>
        </div>

        <div className={styles.mapContainer}>
          <div ref={mapContainerRef} id="map" className={styles.map} />
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.driversHeader}>
          <h3 className={styles.driversTitle}>Available Drivers</h3>
          <div className={styles.driversCount}>
            {loading
              ? "Loading..."
              : `${nearbyRiders.length} driver${nearbyRiders.length !== 1 ? "s" : ""} nearby`}
          </div>
        </div>

        <div className={styles.driversList}>
          {!loading && nearbyRiders.length === 0 && (
            <div className={styles.noDrivers}>No nearby drivers available 🚗</div>
          )}

          {nearbyRiders.map((rider, index) => (
            <div key={index} className={styles.driverCard}>
              <div className={styles.driverHeader}>
                <div className={styles.driverImageContainer}>
                  <img
                    src={rider.picture || "/pic.jpg"}
                    alt={rider.name}
                    className={styles.driverImage}
                    referrerPolicy="no-referrer"
                  />
                  <div className={styles.onlineIndicator}></div>
                </div>
                <div className={styles.driverBasicInfo}>
                  <h4 className={styles.driverName}>{rider.name}</h4>
                  <div className={styles.driverRating}>★★★★★</div>
                </div>
                <div className={styles.driverPrice}>
                  <span className={styles.priceAmount}>
                    <MdCurrencyRupee className={styles.icon} />
                    {rider.price}
                  </span>
                </div>
              </div>

              <div className={styles.driverDetails}>
                <div className={styles.routeInfo}>
                  <div className={styles.routeItem}>
                    <div className={styles.routeIcon}>🚀</div>
                    <div className={styles.routeText}>
                      <span className={styles.routeLabel}>From:</span>
                      <span className={styles.routeValue}>{rider.pickup}</span>
                    </div>
                  </div>
                  <div className={styles.routeItem}>
                    <div className={styles.routeIcon}>🎯</div>
                    <div className={styles.routeText}>
                      <span className={styles.routeLabel}>To:</span>
                      <span className={styles.routeValue}>{rider.drop}</span>
                    </div>
                  </div>
                  <div className={styles.routeItem}>
                    <div className={styles.routeIcon}>🚗</div>
                    <div className={styles.routeText}>
                      <span className={styles.routeLabel}>Car Model:</span>
                      <span className={styles.routeValue}>{rider.carModel}</span>
                    </div>
                  </div>
                  <div className={styles.routeItem}>
                    <div className={styles.routeIcon}>💺</div>
                    <div className={styles.routeText}>
                      <span className={styles.routeLabel}>Seats Available:</span>
                      <span className={styles.routeValue}>{rider.seats}</span>
                    </div>
                  </div>
                  <div className={styles.routeItem}>
                    <div className={styles.routeIcon}>🔢</div>
                    <div className={styles.routeText}>
                      <span className={styles.routeLabel}>Car Number:</span>
                      <span className={styles.routeValue}>{rider.carnumber}</span>
                    </div>
                  </div>
                </div>

                <button
                  className={styles.bookButton}
                  onClick={() => handleBooking(rider)}
                >
                  Book Ride
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Finding;
