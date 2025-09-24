import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaEnvelope, FaMobileAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { auth,googleProvider } from "../firebase";
import { AuthContext } from "../context/AuthContext";

import api from "../utils/base_url"; 
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

const Login = () => {
  const [loginMethod, setLoginMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

const handleGoogleLogin = async () => {
  try {
    // 1. Sign in with Firebase using the Google popup
    const result = await signInWithPopup(auth, googleProvider);

    // 2. Get the Firebase ID token
    const idToken = await result.user.getIdToken();

    // 3. Send the ID token to your Django backend for login
    // This assumes your Django endpoint for login is the same as for registration
    const res = await api.post("google/login/", {
      token: idToken,
    });

    // 4. Handle the successful response from your Django backend
    // The 'login' context function is likely designed to handle the JWT tokens
    login(res.data);
    navigate("/");
    toast.success("Logged in with Google successfully!");
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    toast.error("Google login failed.");
  }
};

  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      { size: "invisible" },
      auth
    );
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    try {
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      toast.success("OTP sent to phone!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    try {
      await confirmationResult.confirm(otp);
      toast.success("Phone login successful!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "#fafcfdff",
      }}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="card p-5 shadow-lg text-center"
        style={{
          borderRadius: "20px",
          width: "100%",
          maxWidth: "420px",
          backdropFilter: "blur(10px)",
          background: "#fcf8f8ff",
          border: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        {/* Logo */}
        <h5 className="fw-bold mb-4" style={{ color: "#333" }}>
          Welcome to E-commerce Website
        </h5>

        {/* Tabs (icon buttons only) */}
        <div className="d-flex justify-content-center mb-4">
          <motion.button
            className={`btn btn-lg mx-2 rounded-circle d-flex align-items-center justify-content-center 
              ${
                loginMethod === "email"
                  ? "btn-light text-dark"
                  : "btn-outline-secondary"
              }`}
            onClick={() => setLoginMethod("email")}
            whileTap={{ scale: 0.9 }}
            style={{ width: "50px", height: "50px" }}
          >
            <FaEnvelope size={20} />
          </motion.button>

          <motion.button
            className={`btn btn-lg mx-2 rounded-circle d-flex align-items-center justify-content-center 
              ${
                loginMethod === "phone"
                  ? "btn-light text-dark"
                  : "btn-outline-secondary"
              }`}
            onClick={() => setLoginMethod("phone")}
            whileTap={{ scale: 0.9 }}
            style={{ width: "50px", height: "50px" }}
          >
            <FaMobileAlt size={20} />
          </motion.button>
        </div>

        {/* Email login */}
        {loginMethod === "email" && (
          <motion.form
            onSubmit={handleEmailLogin}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="form-floating mb-3">
              <input
                type="email"
                label="Email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  borderRadius: "12px",
                  background: "#f0f0f0",
                  color: "#333",
                  border: "1px solid #ddd",
                  padding: "6px 12px",
                  fontSize: "1rem",
                }}
              />
              <label style={{ color: "#555" }}>Email</label>
            </div>
            <div className="form-floating mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  borderRadius: "12px",
                  background: "#f0f0f0",
                  color: "#333",
                  border: "1px solid #ddd",
                  padding: "6px 12px",
                  fontSize: "1rem",
                }}
              />
              <label style={{ color: "#555" }}>Password</label>
            </div>
            <motion.div className="d-grid mb-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="btn btn-light btn-lg fw-bold text-dark"
                style={{
                  border: "1px dotted #000", 
                }}
              >
                Login
              </motion.button>
            </motion.div>
          </motion.form>
        )}

        {/* Phone OTP */}
        {loginMethod === "phone" && (
          <>
            {!confirmationResult ? (
              <motion.form onSubmit={handlePhoneLogin}>
                <div className="form-floating mb-3">
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{
                      borderRadius: "12px",
                      background: "#f0f0f0",
                      color: "#333",
                      border: "1px solid #ddd",
                    }}
                  />
                  <label style={{ color: "#555" }}>Phone Number</label>
                </div>
                <div id="recaptcha-container"></div>
                <motion.div className="d-grid mb-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="btn btn-light btn-lg fw-bold text-dark"
                  >
                    Send OTP
                  </motion.button>
                </motion.div>
              </motion.form>
            ) : (
              <motion.form onSubmit={handleOtpVerify}>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    style={{
                      borderRadius: "12px",
                      background: "#f0f0f0",
                      color: "#333",
                      border: "1px solid #ddd",
                    }}
                  />
                  <label style={{ color: "#555" }}>OTP</label>
                </div>
                <motion.div className="d-grid mb-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="btn btn-light btn-lg fw-bold text-dark"
                  >
                    Verify OTP
                  </motion.button>
                </motion.div>
              </motion.form>
            )}
          </>
        )}

        {/* Google login */}
        <div className="text-center my-1">
          <span style={{ color: "#555" }}>Or login with</span>
        </div>
        <motion.div className="d-grid mb-3">
          <motion.button
            onClick={handleGoogleLogin}
            className="btn btn-outline-dark btn-lg d-flex align-items-center justify-content-center"
            style={{
              borderRadius: "12px",
              background: "#f0f0f0",
              color: "#333",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FcGoogle size={24} className="me-2" /> Login with Google
          </motion.button>
        </motion.div>

        {/* Register */}
        <div className="text-center mt-1">
          <p style={{ color: "#333" }}>
            New here?{" "}
            <Link
              to="/register"
              className="text-decoration-underline text-dark"
            >
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
