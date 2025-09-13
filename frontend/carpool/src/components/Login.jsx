import React, { useState } from 'react';
import styles from "./Login.module.css";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // <-- state for error message
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google/user";
  };

  const handleEvent = async (e) => {
    e.preventDefault();
    setError(""); // reset error before sending request
    try {
      const res = await axios.post("http://localhost:5000/userlogin", {
        email,
        password
      });
      console.log(res.data);
      navigate(`/findR?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error("Login failed:", err);
      // Display a user-friendly error message
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div>
      <img src="/logo.png" alt="logo" className={styles.logo}/>
      <div className={styles.outer}>
        <p className={styles.para}>Login in with Google</p>
                {error && (
          <div
            style={{
              backgroundColor: "#f44336", 
              color: "white",
              opacity:"0.7",
              padding: "10px",
              width:"400px",
              marginLeft:"30px",
              borderRadius: "5px",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            {error}
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
            Create an Account? <a href="" onClick={() => navigate("/signup")} style={{ cursor: "pointer" }}>Sign-up</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
