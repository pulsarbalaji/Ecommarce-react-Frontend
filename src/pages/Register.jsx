import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaEnvelope, FaMobileAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { auth, googleProvider } from "../firebase";
import {
  signInWithPopup,
} from "firebase/auth";
import api from "../utils/base_url";

const Register = () => {
  const [registerMethod, setRegisterMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 📌 EMAIL REGISTER -> Backend API
  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("register/email-step1/", {
        email,
        password,
      });

      toast.success(res.data.message || "OTP sent to email");

      // save session_id for verification
      sessionStorage.setItem("session_id", res.data.session_id);

      navigate("/verification", { state: { type: "email" } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Email register failed");
    } finally {
      setLoading(false);
    }
  };

  // 📌 PHONE REGISTER -> Backend API
  const handlePhoneRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("phone-register-step1/", {
        phone,
      });

      toast.success(res.data.message || "OTP sent to phone");

      // save session_id for verification
      sessionStorage.setItem("session_id", res.data.session_id);

      navigate("/verification", { state: { type: "phone" } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Phone register failed");
    } finally {
      setLoading(false);
    }
  };

  // 📌 GOOGLE REGISTER -> Keep Firebase + Backend integration
  const handleGoogleRegister = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await api.post("google/", { token: idToken });

      // Save JWT tokens
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      toast.success("Google registration successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.error || error.message);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
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
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        {/* Logo */}
        <h4 className="fw-bold mb-4" style={{ color: "#333" }}>
          Create Your Account
        </h4>

        {/* Tabs */}
        <div className="d-flex justify-content-center mb-4">
          <motion.button
            className={`btn btn-lg mx-2 rounded-circle d-flex align-items-center justify-content-center 
              ${registerMethod === "email" ? "btn-light text-dark" : "btn-outline-secondary"}`}
            onClick={() => setRegisterMethod("email")}
            whileTap={{ scale: 0.9 }}
            style={{ width: "60px", height: "60px" }}
          >
            <FaEnvelope size={24} />
          </motion.button>

          <motion.button
            className={`btn btn-lg mx-2 rounded-circle d-flex align-items-center justify-content-center 
              ${registerMethod === "phone" ? "btn-light text-dark" : "btn-outline-secondary"}`}
            onClick={() => setRegisterMethod("phone")}
            whileTap={{ scale: 0.9 }}
            style={{ width: "60px", height: "60px" }}
          >
            <FaMobileAlt size={24} />
          </motion.button>
        </div>

        {/* Email registration */}
        {registerMethod === "email" && (
          <motion.form
            onSubmit={handleEmailRegister}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="form-floating mb-1">
              <input
                type="email"
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
                }}
              />
              <label style={{ color: "#555" }}>Email</label>
            </div>
            <div className="form-floating mb-1">
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
                }}
              />
              <label style={{ color: "#555" }}>Password</label>
            </div>
            <motion.div className="d-grid mb-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="btn btn-light btn-lg fw-bold text-dark"
                disabled={loading}
              >
                {loading ? "Please wait..." : "Register"}
              </motion.button>
            </motion.div>
          </motion.form>
        )}

        {/* Phone registration */}
        {registerMethod === "phone" && (
          <motion.form onSubmit={handlePhoneRegister}>
            <div className="form-floating mb-1">
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
            <motion.div className="d-grid mb-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="btn btn-light btn-lg fw-bold text-dark"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
              </motion.button>
            </motion.div>
          </motion.form>
        )}

        {/* Google */}
        <div className="text-center my-1">
          <span style={{ color: "#555" }}>Or register with</span>
        </div>
        <motion.div className="d-grid mb-1">
          <motion.button
            onClick={handleGoogleRegister}
            className="btn btn-outline-dark btn-lg d-flex align-items-center justify-content-center"
            style={{
              borderRadius: "12px",
              background: "#f0f0f0",
              color: "#333",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FcGoogle size={24} className="me-2" /> Register with Google
          </motion.button>
        </motion.div>

        {/* Login link */}
        <div className="text-center mt-1">
          <p style={{ color: "#333" }}>
            Already have an account?{" "}
            <Link to="/login" className="text-decoration-underline text-dark">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
