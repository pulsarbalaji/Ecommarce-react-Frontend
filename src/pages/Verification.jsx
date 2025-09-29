import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "../utils/base_url";

const Verification = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // type is passed from Register (email / phone)
  const { type } = location.state || {};
  const sessionId = sessionStorage.getItem("session_id");

  useEffect(() => {
    if (!type || !sessionId) {
      toast.error("Session expired, please register again.");
      navigate("/register");
    }
  }, [type, sessionId, navigate]);

  // Countdown for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const getApiUrl = () => {
    if (type === "email") return "register/email-step2/";
    if (type === "phone") return "phone-register-step2/";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post(getApiUrl(), {
        session_id: sessionId,
        otp: otp.join(""),
      });

      if (res.data?.access && res.data?.refresh) {
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);
        toast.success("🎉 OTP Verified! Welcome aboard 🚀");
        navigate("/");
      } else {
        toast.error(res.data.message || "Invalid OTP, please try again.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendTimer(60); // reset countdown
      const endpoint =
        type === "email" ? "register/email-step1/" : "phone-register-step1/";

      const payload =
        type === "email"
          ? { email: sessionStorage.getItem("email") }
          : { phone: sessionStorage.getItem("phone") };

      const res = await api.post(endpoint, payload);

      sessionStorage.setItem("session_id", res.data.session_id);
      toast.success(res.data.message || "OTP resent successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "#f5f7fa" }}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="card p-4 shadow-lg text-center"
        style={{
          borderRadius: "20px",
          width: "100%",
          maxWidth: "400px",
          backdropFilter: "blur(10px)",
          background: "#fff",
        }}
      >
        <h4 className="fw-bold mb-3">
          OTP Verification ({type === "email" ? "Email" : "Phone"})
        </h4>
        <p className="text-muted small mb-3">
          Enter the 6-digit OTP we sent to your {type}. <br />
          Didn’t receive it? You can resend after{" "}
          <span className="fw-bold">{resendTimer}s</span>.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="d-flex justify-content-between mb-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="form-control text-center fw-bold fs-4 mx-1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputsRef.current[index] = el)}
                style={{ width: "50px", height: "60px" }}
              />
            ))}
          </div>

          <motion.div className="d-grid mb-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              disabled={loading}
              className="btn btn-dark btn-lg fw-bold text-white"
            >
              {loading ? "Verifying..." : "Submit OTP"}
            </motion.button>
          </motion.div>
        </form>

        {/* Resend OTP */}
        <div>
          <button
            className="btn btn-link text-decoration-none"
            disabled={resendTimer > 0}
            onClick={handleResendOtp}
          >
            {resendTimer > 0
              ? `Resend OTP in ${resendTimer}s`
              : "Resend OTP"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Verification;
