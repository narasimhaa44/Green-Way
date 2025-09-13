import styles from "./FindUser.module.css";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const FindUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google/finder";
  };

  const handleEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/finderlogin", {
        email,
        password
      });
      console.log(res.data);
      navigate(`/from?email=${encodeURIComponent(res.data.email)}`);
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage("Invalid email or password. Please try again.");
    }
  };

  return (
    <div>
      <img src="/logo.png" alt="logo" className={styles.logo} />
      
      <div className={styles.outer}>
        <p className={styles.para}>Login in with Google</p>

        {errorMessage && (
          <div className={styles.alert}>
            <p>{errorMessage}</p>
          </div>
        )}

        <form className={styles.form} onSubmit={handleEvent}>
          <button type="button" className={styles.btn} onClick={handleGoogleLogin}>
            <img src="/googleicon.png" alt="google" className={styles.google} />
            <span className={styles.text}>Continue with Google</span>
          </button>

          <p>or</p>

          <div className={styles.input}>
            <input
              placeholder="Email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className={styles.btn1}>
            Log in
          </button>

          <p>
            Create an Account? <a href="" onClick={() => navigate("/signupR")} style={{ cursor: "pointer" }}>Sign-up</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default FindUser;
