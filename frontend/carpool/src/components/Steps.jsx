import styles from "./Steps.module.css"
import { Circle, Users, Car, Locate, Phone } from "lucide-react"
import { motion } from "framer-motion";
const Steps = ({ stepsRef }) => {
    const steps = [
        { icon: <Phone />, title: "Create Account", desc: "Sign up and verify in minutes." },
        { icon: <Locate />, title: "Find a Ride", desc: "Search routes easily." },
        { icon: <Users />, title: "Connect", desc: "Match and chat." },
        { icon: <Car />, title: "Travel Together", desc: "Enjoy safe journey." }
    ];
    return (
        <div className={styles.container}>
            <p className={styles.heading}>HOW IT WORKS</p>

            <motion.h1
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                viewport={{ once: true, amount: 0.4 }}
            >
                Simple steps to <br /> share your ride <Circle size={20} fill="green" stroke="none" />
            </motion.h1>
            <div className={styles.stepsWrapper}>
                <motion.div
                    className={styles.line}
                    initial={{ width: 0 }}
                    whileInView={{ width: "86%" }}
                    transition={{ duration: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                />

                <div className={styles.stepsRow}>
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            className={styles.step}
                            initial={{ opacity: 0, y: 22 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.12, duration: 0.42 }}
                            viewport={{ once: true, amount: 0.4 }}
                        >
                            <motion.div
                                className={styles.icon}
                                animate={{ y: [0, -2, 0] }}
                                transition={{
                                    duration: 2.2,
                                    delay: index * 0.15,
                                    repeat: Infinity,
                                    repeatType: "loop"
                                }}
                            >
                                {step.icon}
                            </motion.div>
                            <h3>{step.title}</h3>
                            <p>{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Steps;