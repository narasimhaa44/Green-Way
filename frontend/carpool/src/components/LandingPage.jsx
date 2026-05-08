import styles from "./LandingPage.module.css";
import logo from "../assets/logo.png";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Circle, User, Car, ShieldCheck, Locate, Lock, ChevronRight } from "lucide-react";
import Contact from "./Contact.jsx";
import Steps from "./Steps.jsx";
import { getUser } from "../utils/auth";
import Button from "./Button.jsx";
import ProfileOverlay from "./ProfileOverlay.jsx";

const LandingPage = () => {
    const contactRef = useRef(null);
    const stepsRef = useRef(null);
    const user = getUser();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const userLabel = user?.name || user?.fullName || user?.email?.split("@")[0] || "Profile";
    const userInitial = (userLabel?.trim()?.[0] || "U").toUpperCase();
    return (
        <div className={styles.container}>
            <div className={styles.back}>
                <div className={styles.nav}>
                    <img src={logo} alt="logo" className={styles.logoimg} onClick={() => navigate("/")} />
                    <ul className={styles.ul}>
                        <li><a href="/">Home</a></li>
                        <li><a onClick={() => stepsRef.current.scrollIntoView({ behavior: "smooth" })}>Steps</a></li>
                        <li><a onClick={() => contactRef.current.scrollIntoView({ behavior: "smooth" })}>Contact</a></li>
                    </ul>
                    {user ? (
                        <>
                            <div className={styles.userPill} onClick={() => setIsProfileOpen(true)}>
                                <span className={styles.userAvatar}>{userInitial}</span>
                                <span className={styles.userName}>{userLabel}</span>
                            </div>
                            <div className={styles.desktopButton}>
                                <Button user={user} />
                            </div>
                        </>
                    ) : (
                        <button
                            className={styles.getstarted}
                            onClick={() => navigate("/login")}
                        >
                            Get Started <ArrowRight className={styles.icon} />
                        </button>
                    )}
                </div>
                <div className={styles.hero}>
                    <h1 className={styles.mainheading}>
                        Every Ride
                        <br />
                        Connects Us <Circle fill="green" stroke="none" size={20} className={styles.icon2} />
                    </h1>
                    <p className={styles.para}>
                        Find verified riders on your route and travel together safely, affordably, and sustainably.
                    </p>
                </div>
                <div className={styles.buttons}>
                    <div className={styles.inner1}>
                        <button
                            onClick={() => {
                                if (user) navigate("/from");
                                else navigate("/finduser");
                            }}
                            className={styles.btns}
                        >
                            <Car size={20} /> Offer Ride
                        </button>

                        <button
                            onClick={() => {
                                if (user) navigate("/findR");
                                else navigate("/login");
                            }}
                            className={styles.btns}
                        >
                            <User size={20} /> Need Ride
                        </button>
                    </div>
                </div>
                <div className={styles.features}>
                    <div className={styles.featureItem}>
                        <div className={styles.featureLeft}>
                            <div className={styles.iconBox}><ShieldCheck size={20} /></div>
                            <div>
                                <h3>Verified Profiles</h3>
                                <p>Only verified users</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className={styles.featureArrow} />
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.featureItem}>
                        <div className={styles.featureLeft}>
                            <div className={styles.iconBox}><Locate size={20} /></div>
                            <div>
                                <h3>Real-time Matching</h3>
                                <p>Find the best match</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className={styles.featureArrow} />
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.featureItem}>
                        <div className={styles.featureLeft}>
                            <div className={styles.iconBox}><Lock size={20} /></div>
                            <div>
                                <h3>Secure Payments</h3>
                                <p>100% safe & secure</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className={styles.featureArrow} />
                    </div>
                </div>
            </div>
            <div ref={stepsRef}>
                <Steps />
            </div>
            <div ref={contactRef}>
                <Contact />
            </div>
            {isProfileOpen && (
                <ProfileOverlay user={user} onClose={() => setIsProfileOpen(false)} />
            )}
        </div>
    );
};

export default LandingPage;