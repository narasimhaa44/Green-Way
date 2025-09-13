import styles from "./Finding.module.css";
import { useEffect, useState, useRef } from "react";
import { useLocation,useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MdCurrencyRupee } from "react-icons/md";
import axios from "axios";
const Finding = () => {
  const [locationData, setLocationData] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [nearbyRiders, setNearbyRiders] = useState([]);
  const navigate=useNavigate();
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  const location = useLocation();
  const { pickup, drop, journeyDate,email } = location.state || {};

  const handleBooking=async(rider)=>{
    try{
      const res=await axios.post("http://localhost:5000/booking",{
        userEmail:email,
        riderEmail:rider.email,
        pickup,
        drop,
        journeyDate,
      });
      console.log(res.data);
          // alert("Booking confirmed! An email has been sent.");
          navigate("/SucessU");
    }catch(error){
      console.err("Booking failed",error);
    }
  }
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
    const fetchNearbyRiders = async (pickupCoords) => {
      const res = await fetch("http://localhost:5000/nearby-riders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userLocation: { lat: pickupCoords[0], lng: pickupCoords[1] },
          userDropLocation: { lat: dropCoords[0], lng: dropCoords[1] },
          radius: 2,
        }),
      });
      return res.json();
    };

    if (pickupCoords && dropCoords && mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(pickupCoords, 10);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "GreenWay",
      }).addTo(mapRef.current);

      L.marker(pickupCoords, {
        icon: L.icon({
          iconUrl: "/finder.png",
          iconSize: [60, 60],
          iconAnchor: [30, 60],
        }),
      }).addTo(mapRef.current).bindPopup("Pickup Point");

      L.circle(pickupCoords, {
        radius: 800,
        color: "#c96363ff",
        weight: 3,
        fillColor: "#f70000ff",
        fillOpacity: 0.15,
        dashArray: "10,10",
      }).addTo(mapRef.current);

      L.marker(dropCoords, {
        icon: L.icon({
          iconUrl: "/dest.png",
          iconSize: [30, 40],
          iconAnchor: [30, 40],
        }),
      }).addTo(mapRef.current).bindPopup("Destination");

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

      fetchNearbyRiders(pickupCoords).then((riders) => {
        setNearbyRiders(riders);
        riders.forEach((rider) => {
          L.marker([rider.pickupLat, rider.pickupLng], {
            icon: L.icon({
              iconUrl: "/rider1.png",
              iconSize: [90, 90],
              iconAnchor: [30, 90],
            }),
          }).addTo(mapRef.current).bindPopup(rider.name);
        });
      });

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

  // const renderStars = (rating) => {
  //   const stars = [];
  //   const fullStars = Math.floor(rating);
  //   const hasHalfStar = rating % 1 !== 0;

  //   for (let i = 0; i < fullStars; i++) {
  //     stars.push(<span key={i} className={styles.star}>★</span>);
  //   }

  //   if (hasHalfStar) {
  //     stars.push(<span key="half" className={styles.halfStar}>☆</span>);
  //   }

  //   return stars;
  // };

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
          <div className={styles.mapOverlay}>
            <div className={styles.coordinates}>
              {locationData && (
                <>
                  <div className={styles.coordItem}>
                    <span className={styles.coordLabel}>Lat:</span>
                    <span className={styles.coordValue}>
                      {locationData.latitude.toFixed(6)}
                    </span>
                  </div>
                  <div className={styles.coordItem}>
                    <span className={styles.coordLabel}>Lng:</span>
                    <span className={styles.coordValue}>
                      {locationData.longitude.toFixed(6)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.driversHeader}>
          <h3 className={styles.driversTitle}>Available Drivers</h3>
          <div className={styles.driversCount}>
            {nearbyRiders.length} drivers nearby
          </div>
        </div>

        <div className={styles.driversList}>
          {nearbyRiders.map((rider) => (
            <div key={rider.id} className={styles.driverCard}>
              <div className={styles.driverHeader}>
                <div className={styles.driverImageContainer}>
                  <img
                    src={rider.picture || "/pic.jpg"}
                    alt={rider.name}
                    className={styles.driverImage}
                      referrerPolicy="no-referrer"

                  />
                  {/* <p>{rider.picture}</p> */}
                  <div className={styles.onlineIndicator}></div>
                </div>
                <div className={styles.driverBasicInfo}>
                  <h4 className={styles.driverName}>{rider.name}</h4>
                  <div className={styles.driverRating}>★★★★★</div>
                </div>
                <div className={styles.driverPrice}>
                  <span className={styles.priceAmount}><MdCurrencyRupee  className={styles.icon} />{rider.price}</span>
                </div>
              </div>

              <div className={styles.driverDetails}>
                <div className={styles.routeInfo}>
                  <div className={styles.routeItem}>
                    <div className={styles.routeIcon}>🚀</div>
                    <div className={styles.routeText}>
                      <span className={styles.routeLabel}>From:</span>
                      <span className={styles.routeValue}>
                        {rider.pickup}
                      </span>
                    </div>
                  </div>
                  <div className={styles.routeItem}>
                    <div className={styles.routeIcon}>🎯</div>
                    <div className={styles.routeText}>
                      <span className={styles.routeLabel}>To:</span>
                      <span className={styles.routeValue}>
                        {rider.drop}
                      </span>
                    </div>
                  </div>
                  <div className={styles.routeItem}>
                    <div className={styles.routeIcon}>🚗</div>
                    <div className={styles.routeText}>
                      <span className={styles.routeLabel}>Car Model:</span>
                      <span className={styles.routeValue}>
                        {rider.carModel}
                      </span>
                    </div>
                  </div>
                  <div className={styles.routeItem}>
                    <div className={styles.routeIcon}>💺</div>
                    <div className={styles.routeText}>
                      <span className={styles.routeLabel}>Seats Available:</span>
                      <span className={styles.routeValue}>
                        {rider.seats}
                      </span>
                    </div>
                  </div>
                  <div className={styles.routeItem}>
                    <div className={styles.routeIcon}>🔢</div>
                    <div className={styles.routeText}>
                      <span className={styles.routeLabel}>Car Number:</span>
                      <span className={styles.routeValue}>
                        {rider.carnumber}
                      </span>
                    </div>
                  </div>
                </div>

                <button className={styles.bookButton} onClick={()=>handleBooking(rider)}>Book Ride</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Finding;
