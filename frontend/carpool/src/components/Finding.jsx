import styles from "./Finding.module.css";
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Car, Users, Hash, IndianRupee, ArrowRight, Star } from "lucide-react";
import axios from "axios";

const Finding = () => {
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [nearbyRiders, setNearbyRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  const location = useLocation();
  const { pickup, drop, journeyDate } = location.state || {};
  useEffect(() => {
    if (!pickup || !drop || !journeyDate) {
      alert("Invalid route data");
      navigate("/findR");
    }
  }, []);
  const handleBooking = async (rider) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
  
      if (!user) {
        alert("Please login first");
        navigate("/login");
        return;
      }
  
      setBookingLoading(true);
  
      await axios.post("https://green-wayb.onrender.com/booking",{
        userEmail: user.email,
        riderEmail: rider.email,
  
        pickup: pickup.name, 
        drop: drop.name,     
        journeyDate,
        price: rider.price
      });
  
      alert("Ride booked successfully");
      navigate("/SucessU");
  
    } catch (err) {
      console.log(err.response?.data); // 🔥 DEBUG
      alert("Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    if (pickup && drop) {
      setPickupCoords([pickup.lat, pickup.lng]);
      setDropCoords([drop.lat, drop.lng]);
    }
  }, [pickup, drop]);

  useEffect(() => {
    const fetchNearbyRiders = async () => {
      try {
        const res = await axios.post("https://green-wayb.onrender.com/nearby-riders", {
          userLocation: { lat: pickupCoords[0], lng: pickupCoords[1] },
          userDropLocation: { lat: dropCoords[0], lng: dropCoords[1] },
          radius: 5,
          userJourneyDate: journeyDate,
        });
        return res.data.riders || [];
      } catch {
        return [];
      }
    };

    const setupMap = async () => {
      if (!pickupCoords || !dropCoords || !mapContainerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      mapRef.current = L.map(mapContainerRef.current).setView(pickupCoords, 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapRef.current);

      L.marker(pickupCoords, {
        icon: L.icon({
          iconUrl: "/finder.png",
          iconSize: [60, 60],
          iconAnchor: [30, 60],
        }),
      }).addTo(mapRef.current);

      L.marker(dropCoords, {
        icon: L.icon({
          iconUrl: "/dest.png",
          iconSize: [40, 50],
          iconAnchor: [20, 50],
        }),
      }).addTo(mapRef.current);

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
        color: "#374151",
        weight: 3,
        dashArray: "10, 10"
      }).addTo(mapRef.current);

      const riders = await fetchNearbyRiders();
      setNearbyRiders(riders);
      setLoading(false);

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

      const bounds = L.latLngBounds([pickupCoords, dropCoords]);
      mapRef.current.fitBounds(bounds);
    };

    setupMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [pickupCoords, dropCoords, journeyDate]);

  return (
    <div className={styles.main}>
      <style>{`
        .animated-route {
          animation: route-dash 1s linear infinite;
        }
        @keyframes route-dash {
          to {
            stroke-dashoffset: -20;
          }
        }
      `}</style>
      <div className={styles.left}>
        <div className={styles.mapContainer}>
          <div ref={mapContainerRef} className={styles.map} />
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.driversHeader}>
          <h3>Available Drivers</h3>
          <div>
            {loading
              ? "Loading..."
              : `${nearbyRiders.length} driver${nearbyRiders.length !== 1 ? "s" : ""}`}
          </div>
        </div>

        <div className={styles.driversList}>
          {loading && <div>Loading drivers...</div>}

          {!loading && nearbyRiders.length === 0 && (
            <div>No drivers available</div>
          )}

          {nearbyRiders.map((rider, index) => (
            <div key={index} className={styles.driverCard} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', backgroundColor: 'white', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={rider.picture || "/pic.jpg"} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>{rider.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
                      <Star size={14} color="#f59e0b" fill="#f59e0b" style={{ marginRight: '4px' }} /> 4.8
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>
                  <IndianRupee size={18} />
                  {rider.price}
                </div>
              </div>

              <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', fontSize: '14px', color: '#4b5563' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <MapPin size={16} color="#3b82f6" />
                  <span style={{ fontWeight: '500', color: '#1f2937' }}>{pickup.name}</span>
                  <ArrowRight size={14} color="#9ca3af" />
                  <span style={{ fontWeight: '500', color: '#1f2937' }}>{drop.name}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Car size={16} color="#6b7280" /> {rider.carModel}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} color="#6b7280" /> {rider.seats} seats
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Hash size={16} color="#6b7280" /> {rider.carNumber}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleBooking(rider)}
                disabled={bookingLoading}
                style={{
                  width: '100%', padding: '10px 0', borderRadius: '8px', border: 'none',
                  backgroundColor: '#059669', color: 'white', fontWeight: '600', fontSize: '15px',
                  cursor: bookingLoading ? 'not-allowed' : 'pointer', opacity: bookingLoading ? 0.7 : 1,
                  marginTop: '4px', transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => { if (!bookingLoading) e.currentTarget.style.backgroundColor = '#047857'; }}
                onMouseOut={(e) => { if (!bookingLoading) e.currentTarget.style.backgroundColor = '#059669'; }}
              >
                {bookingLoading ? "Booking..." : "Book Ride"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Finding;