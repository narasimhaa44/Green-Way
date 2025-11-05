import React, { useState } from "react";
import styles from "./SignUp.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CiUser } from "react-icons/ci";

const SignUpRide = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // reset error message

    if (!userName || !email || !password) {
      setErrorMsg("All fields are required");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/finderSignup",
        { userName, email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("✅ Signup success:", res.data);
      navigate("/finduser"); // redirect after success
    } catch (error) {
      console.error("❌ Signup failed:", error);

      if (error.response && error.response.data && error.response.data.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("Signup failed. Try again.");
      }
    }
  };

  return (
    <div>
      <img src="/logo.png" alt="logo" className={styles.logo} />
      <div className={styles.outer}>
        <p className={styles.para}>
          <CiUser className={styles.icon} />
          <span className={styles.headingText}>Join GreenWay!</span>
          <span className={styles.icon}>🌿</span>
        </p>

        {errorMsg && <p style={{ color: "red", textAlign: "center" }}>{errorMsg}</p>}

        <form className={styles.form} onSubmit={handleSignup}>
          <div className={styles.input}>
            <input
              placeholder="User Name"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
            <input
              placeholder="Email"
              type="email"
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

          <button type="submit" className={styles.btn1}>
            Sign up
          </button>

          <p>
            Already have an account?{" "}
            <span
              style={{ cursor: "pointer", color: "blue" }}
              onClick={() => navigate("/finduser")}
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUpRide;
