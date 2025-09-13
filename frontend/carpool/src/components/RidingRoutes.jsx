import styles from "./RidingRoutes.module.css";
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MdCurrencyRupee } from "react-icons/md";
import axios from "axios";

const RidingRoute = () => {
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [name,setName]=useState(null);

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const navigate=useNavigate();
  const location = useLocation();
  const { pickup, drop, journeyDate,carModel, seatsAvailable, carNumber,Cost,email } = location.state || {};

useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/user?email=${email}`);
      setName(res.data.name);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };
  fetchUser();
}, [email]);

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

  useEffect(() => {
    if (pickupCoords && dropCoords && mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(pickupCoords, 10);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "GreenWay",
      }).addTo(mapRef.current);

      // Pickup marker + circle
      L.marker(pickupCoords,{
          icon: L.icon({
          iconUrl: "/finder.png",
          iconSize: [60, 60],
          iconAnchor: [30, 60],
        })
      })
        .addTo(mapRef.current)
        .bindPopup("Pickup Point")

      L.circle(pickupCoords, {
        radius: 800,
        color: "#c96363ff",
        weight: 3,
        fillColor: "#f70000ff",
        fillOpacity: 0.15,
        dashArray: "10,10",
      }).addTo(mapRef.current);

      // Drop marker
      L.marker(dropCoords, {
        icon: L.icon({
          iconUrl: "/dest.png",
          iconSize: [30, 40],
          iconAnchor: [30, 40],
        }),
      })
        .addTo(mapRef.current)
        .bindPopup("Destination");

      // Draw curved line between pickup and drop
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
        className:styles.animatedLine,
      }).addTo(mapRef.current);

      const bounds = L.latLngBounds([pickupCoords, dropCoords]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [pickupCoords, dropCoords]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className={styles.star}>★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className={styles.halfStar}>☆</span>);
    }

    return stars;
  };

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
          <div ref={mapContainerRef} id="map" className={styles.map}></div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.driversHeader}>
          <h3 className={styles.driversTitle}>📃 Summary of Trip</h3>
        </div>
        <hr className={styles.line}></hr>
            <div  className={styles.driverCard}>
              <div className={styles.driverHeader}>
                <div className={styles.driverImageContainer}>
                  <img 
                    src="/pic.jpg"
                    alt="pic"
                    className={styles.driverImage}
                  /> 
                  <div className={styles.onlineIndicator}></div>
                </div>
                <div className={styles.driverBasicInfo}>
                  <h4 className={styles.driverName}>{name}</h4>
                  <div className={styles.driverRating}>
                    {/* {renderStars(rating)} */}
                    <span className={styles.ratingText}></span>
                  </div>
                  <div className={styles.driverExperience}>experience</div>
                </div>
                <div className={styles.driverPrice}>
                  <span className={styles.priceAmount}><MdCurrencyRupee  className={styles.icon} />{Cost}</span>
                </div>
              </div>

              {/* <div className={styles.driverDetails}> */}
                <div className={styles.routeInfo}>
                  <div className={styles.routeItem}>
                    <div className={styles.routeIcon}>🚀</div>
                    <div className={styles.routeText}>
                      <span className={styles.routeLabel}>From:</span>
                      <span className={styles.routeValue}>{pickup}</span>
                    </div>
                  </div>
                  <div className={styles.routeItem}>
                    <div className={styles.routeIcon}>🎯</div>
                    <div className={styles.routeText}>
                      <span className={styles.routeLabel}>To:</span>
                      <span className={styles.routeValue}>{drop}</span>
                    </div>
                  </div>
                  <div className={styles.routeItem}>
                    <div className={styles.routeIcon}>🕒</div>
                    <div className={styles.routeText}>
                      <span className={styles.routeLabel}>Departure:</span>
                      <span className={styles.routeValue}>{journeyDate}</span>
                    </div>
                  </div>
                  <div className={styles.routeItem}>
                    <div className={styles.routeIcon}>🚗</div>
                    <div className={styles.routeText}>
                      <span className={styles.routeLabel}>Vehicle:</span>
                      <span className={styles.routeValue}>{carModel}</span>
                    </div>
                  </div>
                  <div className={styles.routeItem}>
                    <div className={styles.routeIcon}>💺</div>
                    <div className={styles.routeText}>
                      <span className={styles.routeLabel}>Seats Available:</span>
                      <span className={styles.routeValue}>{seatsAvailable}</span>
                    </div>
                  </div>
                  <div className={styles.routeItem}>
                    <div className={styles.routeIcon}>🔢</div>
                    <div className={styles.routeText}>
                      <span className={styles.routeLabel}>car Number:</span>
                      <span className={styles.routeValue}>{carNumber}</span>
                    </div>
                  </div>
                </div>

                <button className={styles.bookButton} onClick={()=>navigate("/SucessR")}>
                  Register Ride
                </button>
              </div>
            </div>
        </div>
  );
};

export default RidingRoute;
