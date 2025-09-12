import React, { useState } from 'react';
import styles from "./SignUp.module.css";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { CiUser } from "react-icons/ci";
import { FaRegUser } from "react-icons/fa";
const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName,setuserName]=useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/userSignup", {
        userName,
        email,
        password,
      });
      console.log(res.data);
      // Redirect to login or dashboard
      navigate("/login");
    } catch (error) {
      console.error("Signup failed:", error);
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
        <form className={styles.form} onSubmit={handleSignup}>
          {/* <button type="button" className={styles.btn} onClick={handleGoogleLogin}>
            <img src="/googleicon.png" alt="google" className={styles.google} />
            <span className={styles.text}>Continue with Google</span>
          </button> */}
          <div className={styles.input}>
            <input
              placeholder="User_Name"
              type="text"
              value={userName}
              onChange={(e) => setuserName(e.target.value)}
              required
            />
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
          <button type="submit" className={styles.btn1}>
            Sign up
          </button>
          <p>
            Already Have an Account? <a href=""onClick={() => navigate("/login")} style={{ cursor: "pointer" }}>Login</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
