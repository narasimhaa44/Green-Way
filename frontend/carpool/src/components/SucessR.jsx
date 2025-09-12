import React from 'react';
import { CheckCircle, Mail, Car, Clock } from 'lucide-react';
import styles from './SucessR.module.css';
import { useNavigate } from 'react-router-dom';
import { MdOutlineConfirmationNumber } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";

const  SuccessR=()=>{
    const navigate=useNavigate();
  return (
    <div className={styles.successContainer}>
      <div className={styles.successCard}>
        <div className={styles.successIconWrapper}>
          <CheckCircle className={styles.successIcon} size={80} />
        </div>
        
        <div className={styles.successContent}>
          <h1 className={styles.successTitle}>Ride Registered Successfully!</h1>
          <p className={styles.successSubtitle}>Your journey is confirmed and ready to go</p>
          
          <div className={styles.infoSection}>
            <div className={styles.infoItem}>
              <Mail className={styles.infoIcon} size={24} />
              <div className={styles.infoText}>
                <h3>Check Your Email</h3>
                <p>Confirmation details have been sent to your inbox</p>
              </div>
            </div>
            
            <div className={styles.infoItem}>
              <FaRegUser  className={styles.infoIcon} size={24} />
              <div className={styles.infoText}>
                <h3>User will be assigned soon!</h3>
                <p>You'll receive user details shortly</p>
              </div>
            </div>
            

          </div>
          
          <div className={styles.actionButtons}>
            <button className={styles.secondaryButton} onClick={()=>navigate("/")}>Book Another Ride</button>
          </div>
        </div>
        
        <div className={styles.decorativeElements}>
          <div className={`${styles.circle} ${styles.circle1}`}></div>
          <div className={`${styles.circle} ${styles.circle2}`}></div>
          <div className={`${styles.circle} ${styles.circle3}`}></div>
        </div>
      </div>
    </div>
  );
}

export default SuccessR;