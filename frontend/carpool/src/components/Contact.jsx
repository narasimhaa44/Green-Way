import styles from "./Contact.module.css";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoLogoYoutube } from "react-icons/io";
import { useEffect, useState, useRef } from "react";

const Contact = () => {

    const middleRef = useRef(null);
    const contactRef = useRef(null);
    const scrollToMiddle = () => {
    middleRef.current.scrollIntoView({ behavior: "smooth" });
  };

    const scrollToContact = () => {
    contactRef.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <div className={styles.header}>
        <div className={styles.side}>
          <div className={styles.matter}>
            <h1>Stay Connected</h1>
            <div className={styles.social}>
              <div className={styles.subsocial}>
                <a href="/">
                  <FaFacebook />
                </a>
              </div>
              <div className={styles.subsocial}>
                <a href="/" style={{ color: "#F75A5A" }}>
                  <FaInstagram />
                </a>
              </div>
              <div className={styles.subsocial}>
                <a href="/" style={{ color: "gray" }}>
                  <FaTwitter />
                </a>
              </div>
              <div className={styles.subsocial}>
                <a href="/">
                  <FaXTwitter />
                </a>
              </div>
              <div className={styles.subsocial}>
                <a href="/" style={{ color: "red" }}>
                  <IoLogoYoutube />
                </a>
              </div>
            </div>
            <p>
              © 2025 Green Way — Making every commute greener, one shared ride
              at a time. Questions? Contact our support team at
              lakshminarasimh44@gamil.com or call +91 9849111050 during business
              hours.
            </p>
          </div>
          <img
            src="/stay.jpg"
            alt="ecofriendly"
            className={styles.footer}
          />
        </div>{" "}
        <footer class="d-flex flex-wrap justify-content-between align-items-center py-3 my-3 border-top">
          {" "}
          <a
            href="/"
            class="col-md-3 d-flex align-items-center justify-content-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none"
            aria-label="Bootstrap"
          >
            {" "}
            <img src="../public/logo.png" alt="logo" className={styles.logo} />
            <p class="col-md-4 mb-0 text-body-secondary">
              © 2025 Company, Inc
            </p>{" "}
          </a>{" "}
          <ul class="nav col-md-4 justify-content-end">
            {" "}
            <li class="nav-item">
              <a href="/" class="nav-link px-2 text-body-secondary">
                Home
              </a>
            </li>{" "}
            <li class="nav-item">
              <a href="/finduser" class="nav-link px-2 text-body-secondary">
                ShareRide
              </a>
            </li>{" "}
            <li class="nav-item">
              <a href="/login" class="nav-link px-2 text-body-secondary">
                SearchRide
              </a>
            </li>{" "}
            <li class="nav-item">
              <a href="#"onClick={scrollToMiddle} class="nav-link px-2 text-body-secondary">
                Layout
              </a>
            </li>{" "}
            <li class="nav-item">
              <a href="#" onClick={scrollToContact}  class="nav-link px-2 text-body-secondary">
                About
              </a>
            </li>{" "}
          </ul>{" "}
        </footer>
      </div>
    </>
  );
};
export default Contact;
