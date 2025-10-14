import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "../utils/base_url";
import { useAuth } from "../context/AuthContext"; // ✅ import context

const Verification = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // ✅ use login from context

  const { type } = location.state || {};
  const sessionId = sessionStorage.getItem("session_id");

  // 🔐 Redirect if invalid
  useEffect(() => {
    if (!type || !sessionId) {
      toast.error("Session expired, please register again.");
      navigate("/register");
    }
  }, [type, sessionId, navigate]);

  // ⏱ Timer for resend
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
      if (value && index < 5) inputsRef.current[index + 1].focus();
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

  // ✅ Submit OTP verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post(getApiUrl(), {
        session_id: sessionId,
        otp: otp.join(""),
      });

      if (res.data?.access && res.data?.refresh) {
        // ✅ Save to session + AuthContext
        const userData = {
          access: res.data.access,
          refresh: res.data.refresh,
          user: res.data.user,
        };

        sessionStorage.setItem("access_token", res.data.access);
        sessionStorage.setItem("refresh_token", res.data.refresh);
        sessionStorage.setItem("user", JSON.stringify(res.data.user));

        login(userData); // ✅ Context sync

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

  // 🔁 Resend OTP
  const handleResendOtp = async () => {
    try {
      setResendTimer(60);
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
    <div className="verification-container d-flex justify-content-center align-items-center">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="verification-card p-4 shadow-lg text-center"
      >
        <h4 className="fw-bold mb-3 verification-title">
          OTP Verification ({type === "email" ? "Email" : "Phone"})
        </h4>

        <p className="text-muted small mb-3 verification-text">
          Enter the 6-digit OTP we sent to your {type}. <br />
          Didn’t receive it? You can resend after{" "}
          <span className="fw-bold">{resendTimer}s</span>.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="otp-inputs d-flex justify-content-between mb-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="form-control otp-input text-center fw-bold fs-4 mx-1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputsRef.current[index] = el)}
              />
            ))}
          </div>

          <motion.div className="d-grid mb-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              disabled={loading}
              className="btn btn-themed btn-lg fw-bold"
            >
              {loading ? "Verifying..." : "Submit OTP"}
            </motion.button>
          </motion.div>
        </form>

        <div>
          <button
            className="btn btn-link text-decoration-none resend-btn"
            disabled={resendTimer > 0}
            onClick={handleResendOtp}
          >
            {resendTimer > 0
              ? `Resend OTP in ${resendTimer}s`
              : "Resend OTP"}
          </button>
        </div>
      </motion.div>

      <style>{`
        .verification-container {
          min-height: 100vh;
          background: linear-gradient(145deg, #fffaf4, #fdf0e2);
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .verification-card {
          border-radius: 24px;
          width: 100%;
          max-width: 420px;
          background: #ffffffcc;
          backdrop-filter: blur(12px);
          border: 1.5px solid #f1e6d4;
          box-shadow: 0 8px 28px rgba(122, 86, 58, 0.22);
          color: #7a563a;
        }
        .verification-title {
          font-weight: 800;
          font-size: 1.9rem;
          color: #7a563a;
        }
        .otp-inputs { gap: 10px; }
        .otp-input {
          width: 55px;
          height: 65px;
          border-radius: 16px;
          border: 1.5px solid #f1e6d4;
          background-color: #fffaf4;
          color: #7a563a;
          font-weight: 800;
          font-size: 2rem;
          transition: all 0.2s ease;
        }
        .otp-input:focus {
          border-color: #7a563a;
          outline: none;
          box-shadow: 0 0 12px rgba(122, 86, 58, 0.6);
        }
        .btn-themed {
          background-color: #7a563a;
          color: white !important;
          border-radius: 30px;
          padding: 16px 0;
          font-size: 1.2rem;
          font-weight: 700;
          box-shadow: 0 8px 20px rgba(122, 86, 58, 0.4);
          border: none;
          transition: 0.3s;
        }
        .btn-themed:disabled {
          background-color: #bba683;
          cursor: not-allowed;
        }
        .btn-themed:hover:not(:disabled) {
          background-color: #68492f;
        }
        .resend-btn {
          color: #7a563a;
          font-weight: 600;
          font-size: 1rem;
        }
        .resend-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default Verification;
