import React, { useState, useEffect } from "react";
import styles from "./ProfileOverlay.module.css";
import pic from "../assets/pic.jpg";
import axios from "axios";
import {
    LayoutDashboard,
    Car,
    MessageCircle,
    LogOut,
    Hourglass,
    CheckCircle,
    XCircle,
    Flag,
    AlertTriangle,
    Clock,
    ThumbsUp,
    X,
    Check,
    CheckCheck,
    Send
} from "lucide-react";
import { io } from "socket.io-client";

const socket = io("https://green-wayb.onrender.com");

const ProfileOverlay = ({ user, onClose }) => {
    const [imgSrc, setImgSrc] = useState(user?.picture || pic);
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    // Chat state
    const [selectedRide, setSelectedRide] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    const currentUser = JSON.parse(localStorage.getItem("user"));

    // Chat hooks
    useEffect(() => {
        if (selectedRide) {
            socket.emit("joinRoom", selectedRide._id);
        }
    }, [selectedRide]);

    useEffect(() => {
        if (!selectedRide) return;
        const fetchMessages = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/message/${selectedRide._id}`);
                setMessages(res.data);
            } catch (err) {
                console.error("Failed to load messages", err);
            }
        };
        fetchMessages();
    }, [selectedRide]);

    useEffect(() => {
        socket.on("receiveMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });
        return () => socket.off("receiveMessage");
    }, []);

    const sendMessage = () => {
        if (!text.trim()) return;
        const receiver = currentUser.email === selectedRide.userEmail
            ? selectedRide.riderEmail
            : selectedRide.userEmail;

        socket.emit("sendMessage", {
            bookingId: selectedRide._id,
            sender: currentUser.email,
            receiver,
            text
        });
        setText("");
    };

    // 🔥 ACCEPT (ROLE FIXED)
    const handleAccept = async (ride) => {
        const role =
            currentUser.email === ride.riderEmail ? "driver" : "user";

        await axios.post(
            `https://green-wayb.onrender.com/booking/accept/${ride._id}`,
            { role }
        );

        window.location.reload();
    };

    const handleCancel = async (id) => {
        await axios.post(`https://green-wayb.onrender.com/booking/cancel/${id}`);
        window.location.reload();
    };

    const handleComplete = async (id) => {
        await axios.post(`https://green-wayb.onrender.com/booking/complete/${id}`);
        window.location.reload();
    };

    useEffect(() => {
        const fetchRides = async () => {
            try {
                const res = await axios.get(
                    `https://green-wayb.onrender.com/my-rides?email=${currentUser.email}`
                );
                setRides(res.data || []);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRides();
    }, []);

    const upcoming = rides.filter(
        (r) => r.status !== "completed" && r.status !== "cancelled" && new Date(r.journeyDate) >= new Date(new Date().setHours(0, 0, 0, 0))
    );

    const past = rides.filter(
        (r) => r.status === "completed" || r.status === "cancelled" || new Date(r.journeyDate) < new Date(new Date().setHours(0, 0, 0, 0))
    );

    return (
        <div className={styles.overlay}>
            <div className={styles.backdrop} onClick={onClose}></div>

            <div className={styles.card}>
                {/* LEFT */}
                <div className={styles.left}>
                    <div className={styles.header}>
                        <img
                            src={imgSrc}
                            onError={() => setImgSrc(pic)}
                            className={styles.avatar}
                        />
                        <h3>{user?.name}</h3>
                        <p>{user?.email}</p>
                    </div>

                    <div className={styles.menu}>
                        <div
                            className={`${styles.menuItem} ${activeTab === "overview" && styles.active
                                }`}
                            onClick={() => setActiveTab("overview")}
                        >
                            <LayoutDashboard size={18} /> Overview
                        </div>

                        <div
                            className={`${styles.menuItem} ${activeTab === "rides" && styles.active
                                }`}
                            onClick={() => setActiveTab("rides")}
                        >
                            <Car size={18} /> My Rides
                        </div>

                        <div
                            className={`${styles.menuItem} ${activeTab === "messages" && styles.active
                                }`}
                            onClick={() => setActiveTab("messages")}
                        >
                            <MessageCircle size={18} /> Messages
                        </div>

                        <hr />

                        <div
                            className={styles.menuItem}
                            onClick={() => {
                                localStorage.removeItem("user");
                                window.location.reload();
                            }}
                            style={{ color: "red" }}
                        >
                            <LogOut size={18} /> Logout
                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <div className={styles.right}>
                    {activeTab === "rides" && (
                        <>
                            <h4>My Rides</h4>

                            <p>Upcoming</p>

                            {upcoming.map((r) => {
                                const isDriver = currentUser.email === r.riderEmail;

                                return (
                                    <div key={r._id} className={styles.rideCard}>
                                        {r.pickup} → {r.drop}
                                        <br />
                                        <small>
                                            {new Date(r.journeyDate).toLocaleString()}
                                        </small>
                                        <p>Price: ₹{r.price}</p>

                                        {/* STATUS */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                            <span>Status:</span>
                                            {r.status === "confirmed"
                                                ? <><CheckCircle size={16} color="#22c55e" /> Confirmed</>
                                                : r.status === "cancelled"
                                                    ? <><XCircle size={16} color="#ef4444" /> Cancelled</>
                                                    : r.status === "completed"
                                                        ? <><CheckCheck size={16} color="#3b82f6" /> Completed</>
                                                        : r.userAccepted && !r.driverAccepted
                                                            ? isDriver
                                                                ? <><AlertTriangle size={16} color="#f59e0b" /> Accept the ride</>
                                                                : <><Hourglass size={16} color="#f59e0b" /> Waiting for driver</>
                                                            : !r.userAccepted && r.driverAccepted
                                                                ? isDriver
                                                                    ? <><Hourglass size={16} color="#f59e0b" /> Waiting for user</>
                                                                    : <><AlertTriangle size={16} color="#f59e0b" /> Accept the ride</>
                                                                : <><Clock size={16} color="#f59e0b" /> Pending</>}
                                        </div>

                                        <div className={styles.actions} style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                                            {/* CANCEL */}
                                            {r.status !== "completed" &&
                                                r.status !== "cancelled" && (
                                                    <button
                                                        onClick={() => handleCancel(r._id)}
                                                        title="Cancel"
                                                        style={{
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            width: '36px', height: '36px', borderRadius: '50%',
                                                            backgroundColor: 'transparent', border: '1.5px solid #ef4444',
                                                            color: '#ef4444', cursor: 'pointer', padding: 0,
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                                                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                    >
                                                        <X size={18} strokeWidth={1.5} />
                                                    </button>
                                                )}

                                            {/* ACCEPT */}
                                            {((!r.userAccepted && !isDriver) ||
                                                (!r.driverAccepted && isDriver)) &&
                                                r.status === "pending" && (
                                                    <button
                                                        onClick={() => handleAccept(r)}
                                                        title="Accept"
                                                        style={{
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            width: '36px', height: '36px', borderRadius: '50%',
                                                            backgroundColor: 'transparent', border: '1.5px solid #3b82f6',
                                                            color: '#3b82f6', cursor: 'pointer', padding: 0,
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                                                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                    >
                                                        <Check size={18} strokeWidth={1.5} />
                                                    </button>
                                                )}

                                            {/* COMPLETE */}
                                            {r.status === "confirmed" && (
                                                <button
                                                    onClick={() => handleComplete(r._id)}
                                                    title="Complete"
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        width: '36px', height: '36px', borderRadius: '50%',
                                                        backgroundColor: 'transparent', border: '1.5px solid #22c55e',
                                                        color: '#22c55e', cursor: 'pointer', padding: 0,
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                >
                                                    <CheckCircle size={18} strokeWidth={1.5} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            <h4 style={{ marginTop: "28px", marginBottom: "16px", color: '#0f172a' }}>Previous</h4>

                            {past.length === 0 ? (
                                <p style={{ color: '#64748b' }}>No previous rides.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {past.map((r) => (
                                        <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', opacity: 0.8, transition: 'all 0.2s' }}
                                            onMouseOver={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                                            onMouseOut={(e) => { e.currentTarget.style.opacity = 0.8; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                                            <div style={{ minWidth: 0, paddingRight: '12px' }}>
                                                <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.pickup.split(',')[0]} → {r.drop.split(',')[0]}</div>
                                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Clock size={14} /> {new Date(r.journeyDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <div>
                                                <span style={{
                                                    padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                                                    backgroundColor: r.status === 'cancelled' ? '#fee2e2' : '#dcfce7',
                                                    color: r.status === 'cancelled' ? '#991b1b' : '#166534',
                                                    display: 'flex', alignItems: 'center', gap: '4px'
                                                }}>
                                                    {r.status === 'cancelled' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                                                    {r.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                    {activeTab === "overview" && (
                        <div style={{ paddingBottom: '20px' }}>
                            <h4 style={{ marginBottom: '16px' }}>Overview</h4>

                            <div className={styles.stats} style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Car size={16} color="#3b82f6" /> {rides.length} total rides</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Hourglass size={16} color="#f59e0b" /> {upcoming.length} upcoming</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="#22c55e" /> {past.length} past/completed</div>
                            </div>

                            <h5 style={{ marginBottom: '12px', fontSize: '16px', color: '#1e293b' }}>All Rides History</h5>
                            {rides.length === 0 ? (
                                <p style={{ color: '#64748b' }}>No rides found.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {rides.map(r => (
                                        <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ minWidth: 0, paddingRight: '12px' }}>
                                                <div style={{ fontWeight: '500', color: '#0f172a', fontSize: '14.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.pickup.split(',')[0]} → {r.drop.split(',')[0]}</div>
                                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{new Date(r.journeyDate).toLocaleDateString()}</div>
                                            </div>
                                            <div>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                                                    backgroundColor: r.status === 'completed' ? '#dcfce7' : r.status === 'cancelled' ? '#fee2e2' : r.status === 'confirmed' ? '#e0f2fe' : '#fef3c7',
                                                    color: r.status === 'completed' ? '#166534' : r.status === 'cancelled' ? '#991b1b' : r.status === 'confirmed' ? '#075985' : '#92400e'
                                                }}>
                                                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "messages" && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '450px', backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden' }}>
                            {!selectedRide ? (
                                <div style={{ padding: '20px' }}>
                                    <h4 style={{ margin: '0 0 20px', fontSize: '20px', color: '#0f172a' }}>Chats</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {rides.filter(r => r.status === "confirmed").length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                                                <MessageCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                                                <p>No active chats yet.</p>
                                            </div>
                                        )}
                                        {rides.filter(r => r.status === "confirmed").map(r => (
                                            <div
                                                key={r._id}
                                                onClick={() => setSelectedRide(r)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                                                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                            >
                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#4f46e5', flexShrink: 0 }}>
                                                    <Car size={24} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                        <h5 style={{ margin: 0, fontSize: '15px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {r.pickup.split(',')[0]} → {r.drop.split(',')[0]}
                                                        </h5>
                                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                                            {new Date(r.journeyDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Tap to view messages</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f8fafc' }}>
                                    <style>{`
                                        .chat-scroll::-webkit-scrollbar {
                                            display: none;
                                        }
                                        .chat-scroll {
                                            -ms-overflow-style: none;
                                            scrollbar-width: none;
                                        }
                                    `}</style>
                                    {/* Chat Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', zIndex: 10 }}>
                                        <button
                                            onClick={() => setSelectedRide(null)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', transition: 'background-color 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                        </button>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#4f46e5' }}>
                                            <Car size={20} />
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <h4 style={{ margin: 0, color: '#0f172a', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {selectedRide.pickup.split(',')[0]} → {selectedRide.drop.split(',')[0]}
                                            </h4>
                                            <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span> Online
                                            </span>
                                        </div>
                                    </div>

                                    {/* Chat Messages */}
                                    <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
                                        {messages.length === 0 && (
                                            <div style={{ margin: 'auto', textAlign: 'center', backgroundColor: '#ffffff', padding: '12px 24px', borderRadius: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', color: '#64748b', fontSize: '13px' }}>
                                                No messages yet. Say hi! 👋
                                            </div>
                                        )}
                                        {messages.map((m, i) => {
                                            const isMe = m.sender === currentUser.email;
                                            return (
                                                <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                                    <div style={{
                                                        maxWidth: '80%', padding: '12px 16px', fontSize: '14.5px', lineHeight: '1.4',
                                                        backgroundColor: isMe ? '#8b5cf6' : '#ffffff',
                                                        color: isMe ? 'white' : '#1e293b',
                                                        borderBottomRightRadius: isMe ? '4px' : '20px',
                                                        borderBottomLeftRadius: isMe ? '20px' : '4px',
                                                        borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
                                                        boxShadow: isMe ? '0 4px 6px -1px rgba(139, 92, 246, 0.2)' : '0 1px 3px rgba(0,0,0,0.1)'
                                                    }}>
                                                        {m.text}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Chat Input */}
                                    <div style={{ padding: '16px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '24px', padding: '0 16px' }}>
                                            <input
                                                value={text}
                                                onChange={(e) => setText(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                                placeholder="Type a message..."
                                                style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', padding: '14px 0', fontSize: '15px', color: '#1e293b' }}
                                            />
                                        </div>
                                        <button
                                            onClick={sendMessage}
                                            style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#8b5cf6', color: 'white', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3)' }}
                                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#7c3aed'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#8b5cf6'; e.currentTarget.style.transform = 'scale(1)'; }}
                                        >
                                            <Send size={20} style={{ marginLeft: '2px' }} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileOverlay;