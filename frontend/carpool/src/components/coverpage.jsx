import styles from "./coverpage.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Contact from "./Contact";
import { FiSearch } from "react-icons/fi";
import { FaCarRear } from "react-icons/fa6";
import { LuLeaf } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

const CoverPage = () => {
  const navigate = useNavigate();
  const fullText = "S hare a ride, save time, and help the planet.";
  const [displayedText, setDisplayedText] = useState("");

  const middleRef = useRef(null);
  const contactRef = useRef(null);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + fullText[index]);
      index++;
      if (index === fullText.length - 1) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const scrollToMiddle = () => {
    middleRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    contactRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header className="d-flex flex-wrap justify-content-center">
        <a
          href="/"
          className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none"
        >
          <span className="fs-2">
            <img src="/logo.png" className={styles.logo} alt="Logo" />
          </span>
        </a>
        <ul className="nav nav-pills">
          <li className="nav-item">
            <a href="/" className="nav-link" style={{ color: "black" }} aria-current="page">
              Home
            </a>
          </li>
          <li className="nav-item">
            <a href="/finduser" style={{ color: "black" }} className="nav-link">
              ShareRide
            </a>
          </li>
          <li className="nav-item">
            <a href="/login" style={{ color: "black" }} className="nav-link">
              SearchRide
            </a>
          </li>
          <li className="nav-item">
            <button onClick={scrollToMiddle} className="nav-link btn btn-link" style={{ color: "black", textDecoration: "none" }}>
              Layout
            </button>
          </li>
          <li className="nav-item">
            <button onClick={scrollToContact} className="nav-link btn btn-link" style={{ color: "black", textDecoration: "none" }}>
              About
            </button>
          </li>
        </ul>
      </header>
      <div className={styles.main}>
      <diV className={styles.right}>
        <div className={styles.inner}>
          <h2 className={styles.mainmatter}>Start Car Pooling Now!</h2>
          <diV className={styles.inner2}>
            <p>{displayedText} </p>
          </diV>
          <div className={styles.dia}>
          <div className={styles.inner1}>
          <button onClick={() => navigate("/finduser")} className={styles.buttons}>
            🚗 Offer Ride
          </button>
          <button onClick={() => navigate("/login")} className={styles.buttons}>
            🙋 Need Ride
          </button>
          </div>
          <img src="/log.png" className={styles.side}/>
          </div>
        </div>
      </diV>
      <div className={styles.left1}>
          <img src="/coverpage.png" className={styles.left2}/>
      </div>
      </div>

      <div ref={middleRef} className={styles.middle}>
        <img src="/connect.png" className={styles.connect} alt="Connect" />
        <div className={styles.innermid}>
          <h1 className={styles.mainheading}>Connect With people</h1>
          <div className={styles.subheading}>
            <h3>
              <FiSearch /> Match
            </h3>
            <p>
              Match Find compatible riders and drivers along your route with our smart matching algorithm.
            </p>
          </div>
          <div className={styles.subheading}>
            <h3>
              <FaCarRear /> Ride
            </h3>
            <p>
              Share comfortable, affordable journeys with verified community members.
            </p>
          </div>
          <div className={styles.subheading}>
            <h3>
              <LuLeaf /> Save
            </h3>
            <p>
              Cut costs, reduce emissions, and earn rewards with every shared trip.
            </p>
          </div>
        </div>
      </div>

      <div ref={contactRef}>
        <Contact />
      </div>
    </>
  );
};

export default CoverPage;
