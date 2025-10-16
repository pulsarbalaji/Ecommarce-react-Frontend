import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

  const { type } = location.state || {};
  const sessionId = sessionStorage.getItem("session_id");

  useEffect(() => {
    if (!type || !sessionId) {
      toast.error("Session expired, please register again.");
      navigate("/register");
    }
  }, [type, sessionId, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (value, index) => {
    if (/^\d?$/.test(value)) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(getApiUrl(), {
        session_id: sessionId,
        otp: otp.join(""),
      });
      if (res.data?.access && res.data?.refresh) {
        sessionStorage.setItem("access_token", res.data.access);
        sessionStorage.setItem("refresh_token", res.data.refresh);
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success("🎉 OTP Verified! Welcome aboard 🚀");
        navigate("/");
      } else {
        toast.error(res.data.message || "Invalid OTP, please try again.");
      }
    } catch (err) {
      const errorData = err.response?.data;

      const errorMessage =
        errorData?.error ||
        errorData?.errors?.non_field_errors?.[0] || // handles {"errors":{"non_field_errors":["Invalid OTP"]}}
        errorData?.errors ||
        errorData?.message ||
        "OTP verification failed. Please try again.";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendTimer(60);

      const endpoint =
        type === "email" ? "register/email-step1/" : "phone-login-step1/";

      // ✅ Get from sessionStorage
      const payload =
        type === "email"
          ? { email: sessionStorage.getItem("email"), password: sessionStorage.getItem("password") }
          : { phone: sessionStorage.getItem("phone") };

      if (!payload.email && !payload.phone) {
        toast.error("Missing email or phone. Please login again.");
        navigate("/login");
        return;
      }

      const res = await api.post(endpoint, payload);
      sessionStorage.setItem("session_id", res.data.session_id);
      toast.success(res.data.message || "OTP resent successfully");
      setOtp(["", "", "", "", "", ""]);

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
        <p className="text-muted small mb-4">
          Enter the 6-digit OTP we sent to your {type}. <br />
          Didn’t receive it? You can resend after{" "}
          <span className="fw-bold">{resendTimer}s</span>.
        </p>

        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                className="otp-input text-center fw-bold"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputsRef.current[index] = el)}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            disabled={loading}
            className="btn btn-themed btn-lg fw-bold w-100"
            type="submit"
          >
            {loading ? "Verifying..." : "Submit OTP"}
          </motion.button>
        </form>

        <button
          className="btn btn-link text-decoration-none mt-3 resend-btn"
          disabled={resendTimer > 0}
          onClick={handleResendOtp}
        >
          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
        </button>
      </motion.div>

      <style>{`
        .verification-container {
          min-height: 100vh;
          background: linear-gradient(145deg, #fffaf4, #fdf0e2);
          padding: 20px;
        }
        .verification-card {
          max-width: 400px;
          width: 100%;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1.5px solid #f1e6d4;
          border-radius: 24px;
          box-shadow: 0 8px 28px rgba(122, 86, 58, 0.22);
          padding: 30px 20px;
        }
        .verification-title {
          font-weight: 800;
          font-size: 1.9rem;
          color: #7a563a;
        }
        .otp-inputs {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          flex-wrap: nowrap;
          overflow-x: auto;
        }
        .otp-input {
          flex: 1;
          min-width: 45px;
          max-width: 55px;
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
          color: #fff;
          border-radius: 30px;
          font-size: 1.2rem;
          padding: 16px 0;
          border: none;
          font-weight: 700;
        }
        .btn-themed:disabled {
          background-color: #bba683;
          cursor: not-allowed;
        }
        .btn-themed:hover:not(:disabled) {
          background-color: #68492f;
          box-shadow: 0 8px 20px rgba(122, 86, 58, 0.5);
        }
        .resend-btn {
          font-weight: 600;
          font-size: 1rem;
          color: #7a563a;
        }
        @media (max-width: 600px) {
          .otp-input {
            min-width: 40px;
            max-width: 45px;
            height: 55px;
            font-size: 1.6rem;
          }
          .otp-inputs {
            gap: 8px;
          }
        }
        @media (max-width: 400px) {
          .otp-input {
            min-width: 36px;
            max-width: 40px;
            height: 50px;
            font-size: 1.4rem;
          }
          .otp-inputs {
            gap: 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default Verification;
