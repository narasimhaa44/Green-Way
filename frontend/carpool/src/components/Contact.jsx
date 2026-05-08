import styles from "./Contact.module.css";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoLogoYoutube } from "react-icons/io5";
import { useRef } from "react";

const Contact = () => {
  const middleRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToMiddle = (e) => {
    e.preventDefault();
    middleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToContact = (e) => {
    e.preventDefault();
    contactRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div className={styles.header}>
        <div className={styles.side}>
          <div className={styles.matter}>
            <h1>Stay Connected</h1>

            <div className={styles.social} aria-label="social links">
              <a
                className={styles.subsocial}
                href="https://facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <FaFacebook />
              </a>

              <a
                className={styles.subsocial}
                href="https://instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>

              {/* keep either Twitter or X; leaving both for now */}
              <a
                className={styles.subsocial}
                href="https://twitter.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>

              <a
                className={styles.subsocial}
                href="https://x.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
              >
                <FaXTwitter />
              </a>

              <a
                className={styles.subsocial}
                href="https://youtube.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
              >
                <IoLogoYoutube />
              </a>
            </div>

            <p className={styles.blurb}>
              © 2025 Green Way — Making every commute greener, one shared ride
              at a time. Questions? Contact our support team at{" "}
              <a href="mailto:[EMAIL_ADDRESS]">
                lakshminarasimh44@gmail.com
              </a>
            </p>
          </div>

          <img
            src="/stay.jpg"
            alt="Eco-friendly commute illustration"
            className={styles.footerImg}
            loading="lazy"
          />
        </div>

        {/* sections to scroll to */}
        <section ref={middleRef} className={styles.sectionAnchor}>
          {/* put your “Layout” content here */}
        </section>
        <section ref={contactRef} className={styles.sectionAnchor}>
          {/* put your “About” content here */}
        </section>

        {/* footer */}
        <footer
          className={`${styles.right1} d-flex flex-wrap justify-content-between align-items-center py-3 my-3 border-top`}
        >
          <div className={styles.in}>
            <img src="/logo.png" alt="Green Way logo" className={styles.logo} />
            <p className="col-md-4 mb-0 text-body-secondary">© 2025 Company, Inc</p>

            <ul className={`${styles.ul1} nav col-md-4 justify-content-end`}>
              <li className="nav-item">
                <a href="/" className="nav-link px-2 text-body-secondary">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a href="/finduser" className="nav-link px-2 text-body-secondary">
                  ShareRide
                </a>
              </li>
              <li className="nav-item">
                <a href="#about" onClick={scrollToContact} className="nav-link px-2 text-body-secondary">
                  Steps
                </a>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Contact;
