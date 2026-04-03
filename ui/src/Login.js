import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";


function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/login", {
        username,
        password
      });

      localStorage.setItem("token", res.data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      {/* Animated Card */}
      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >

        {/* Logo */}
        <motion.div
          style={styles.logo}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          💧💧
        </motion.div>

        <h1 style={styles.title}>Satluj.UI</h1>
        <p style={styles.subtitle}>Welcome user</p>
        <input
          style={styles.input}
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Error Message */}
        {error && (
          <motion.p
            style={styles.error}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        {/* Button */}
        <motion.button
          style={styles.button}
          onClick={handleLogin}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          {loading ? <div style={styles.spinner}></div> : "Login"}
        </motion.button>

        <motion.p
  style={styles.signupText}
  onClick={() => window.location.href = "/signup"}
  whileHover={{ scale: 1.05 }}
>
  Don’t have an account? <span style={styles.signupLink}>Create Account</span>
</motion.p>

      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1a0000, #8B0000, #ff1a1a)",
    fontFamily: "Arial"
  },
  card: {
    background: "rgba(255,255,255,0.1)",
    padding: "40px",
    borderRadius: "20px",
    backdropFilter: "blur(15px)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    textAlign: "center",
    width: "320px",
    color: "white"
  },
  logo: {
    fontSize: "40px",
    marginBottom: "10px"
  },
  title: {
    marginBottom: "5px"
  },
  subtitle: {
    marginBottom: "25px",
    opacity: 0.8
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "none",
    outline: "none"
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#ff1a1a",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px"
  },
  error: {
    color: "#ffcccc",
    marginBottom: "10px",
    fontSize: "14px"
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "3px solid #fff",
    borderTop: "3px solid transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "auto"
  }
};

export default Login;