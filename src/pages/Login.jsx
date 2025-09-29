import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaMobileAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { auth, googleProvider } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/base_url";
import {
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [loginMethod, setLoginMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // ---------- Email Login via Django API ----------
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("customer/login/", { email, password });
      login(res.data); // store tokens & user in session
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  // ---------- Google Login via Firebase ----------
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await api.post("google/login/", { token: idToken });
      login(res.data);
      toast.success("Logged in with Google!");
      navigate("/");
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error("Google login failed.");
    }
  };

  // ---------- Setup Recaptcha ----------
  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      { size: "invisible" },
      auth
    );
  };

  // ---------- Phone Login / OTP ----------
  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    setupRecaptcha();
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      toast.success("OTP sent!");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await confirmationResult.confirm(otp);

      // const token = await userCredential.user.getIdToken();

      // Send token to backend to validate / login
      const res = await api.post("phone-login-step1/", {
        session_id: userCredential.verificationId,
        otp,
      });
      login(res.data);
      toast.success("Phone login successful!");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "OTP verification failed");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#fafcfd" }}>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="card p-5 shadow-lg text-center"
        style={{ borderRadius: "20px", width: "100%", maxWidth: "420px", backdropFilter: "blur(10px)", background: "#fcf8f8", border: "1px solid rgba(0,0,0,0.1)" }}
      >
        <h5 className="fw-bold mb-4" style={{ color: "#333" }}>Welcome to E-commerce Website</h5>

        {/* Login method tabs */}
        <div className="d-flex justify-content-center mb-4">
          <motion.button
            className={`btn btn-lg mx-2 rounded-circle d-flex align-items-center justify-content-center ${loginMethod === "email" ? "btn-light text-dark" : "btn-outline-secondary"}`}
            onClick={() => setLoginMethod("email")}
            whileTap={{ scale: 0.9 }}
            style={{ width: "50px", height: "50px" }}
          >
            <FaEnvelope size={20} />
          </motion.button>
          <motion.button
            className={`btn btn-lg mx-2 rounded-circle d-flex align-items-center justify-content-center ${loginMethod === "phone" ? "btn-light text-dark" : "btn-outline-secondary"}`}
            onClick={() => setLoginMethod("phone")}
            whileTap={{ scale: 0.9 }}
            style={{ width: "50px", height: "50px" }}
          >
            <FaMobileAlt size={20} />
          </motion.button>
        </div>

        {/* Email login */}
        {loginMethod === "email" && (
          <motion.form onSubmit={handleEmailLogin} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="form-floating mb-3">
              <input type="email" className="form-control" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ borderRadius: "12px", background: "#f0f0f0", color: "#333", border: "1px solid #ddd", padding: "6px 12px", fontSize: "1rem" }} />
              <label style={{ color: "#555" }}>Email</label>
            </div>
            <div className="form-floating mb-3">
              <input type="password" className="form-control" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ borderRadius: "12px", background: "#f0f0f0", color: "#333", border: "1px solid #ddd", padding: "6px 12px", fontSize: "1rem" }} />
              <label style={{ color: "#555" }}>Password</label>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} className="btn btn-light btn-lg fw-bold text-dark w-100">Login</motion.button>
          </motion.form>
        )}

        {/* Phone login */}
        {loginMethod === "phone" && (
          <>
            {!confirmationResult ? (
              <motion.form onSubmit={handlePhoneLogin}>
                <div className="form-floating mb-3">
                  <input type="tel" className="form-control" placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} required style={{ borderRadius: "12px", background: "#f0f0f0", color: "#333", border: "1px solid #ddd" }} />
                  <label style={{ color: "#555" }}>Phone Number</label>
                </div>
                <div id="recaptcha-container"></div>
                <motion.button whileHover={{ scale: 1.05 }} className="btn btn-light btn-lg fw-bold text-dark w-100">Send OTP</motion.button>
              </motion.form>
            ) : (
              <motion.form onSubmit={handleOtpVerify}>
                <div className="form-floating mb-3">
                  <input type="text" className="form-control" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required style={{ borderRadius: "12px", background: "#f0f0f0", color: "#333", border: "1px solid #ddd" }} />
                  <label style={{ color: "#555" }}>OTP</label>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} className="btn btn-light btn-lg fw-bold text-dark w-100">Verify OTP</motion.button>
              </motion.form>
            )}
          </>
        )}

        {/* Google login */}
        <div className="text-center my-2">
          <motion.button onClick={handleGoogleLogin} className="btn btn-outline-dark btn-lg d-flex align-items-center justify-content-center w-100" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <FcGoogle size={24} className="me-2" /> Login with Google
          </motion.button>
        </div>

        <p className="text-center mt-2" style={{ color: "#333" }}>
          New here? <Link to="/register" className="text-decoration-underline text-dark">Register</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
