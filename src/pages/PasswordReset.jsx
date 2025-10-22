import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/base_url";
import { FaEnvelope } from "react-icons/fa";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("forgot-password-customer/", { email });

      if (res.data.status === true) {
        toast.success("Password reset link sent to your email!");
        setTimeout(() => navigate("/login"), 2500);
      } else {
        toast.error(res.data.message || "Failed to send reset link.");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-wrapper">
      <motion.div
        className="reset-card"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <h3 className="reset-title">Forgot Your Password?</h3>
        <p className="reset-subtitle">
          No worries! Enter your registered email and we’ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="reset-form">
          <div className="floating-input">
            <input
              type="email"
              placeholder=" "
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>
              <FaEnvelope /> Email
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary reset-btn"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="back-login">
          <Link to="/login" className="login-link">
            ← Back to Login
          </Link>
        </div>
      </motion.div>

      {/* 🌿 Green Theme Styles */}
      <style>{`
        .reset-wrapper {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #fffaf4;
          padding: 20px;
        }
        .reset-card {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border-radius: 20px;
          padding: 40px 30px;
          box-shadow: 0 10px 25px rgba(25, 135, 84, 0.2);
          text-align: center;
        }
        .reset-title {
          font-size: 1.8rem;
          margin-bottom: 15px;
          font-weight: 700;
          color: #000000ff;
        }
        .reset-subtitle {
          font-size: 1rem;
          color: #000000ff;
          opacity: 0.8;
          margin-bottom: 35px;
          line-height: 1.5;
        }
        .reset-form {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }
        .floating-input {
          position: relative;
        }
        .floating-input input {
          width: 100%;
          padding: 14px 14px 14px 42px;
          font-size: 1.1rem;
          border-radius: 15px;
          border: 1.5px solid #cde6ce;
          background: #f9fff9;
          color: #000000ff;
          font-weight: 600;
          outline: none;
        }
        .floating-input label {
          position: absolute;
          left: 42px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #000000ff;
          font-weight: 600;
          transition: 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .floating-input input:focus + label,
        .floating-input input:not(:placeholder-shown) + label {
          top: 5px;
          font-size: 0.85rem;
          color: #198754;
          background: #f9fff9;
          padding: 0 8px;
          border-radius: 8px;
          left: 15px;
        }

        /* ✅ Button */
        .btn-primary.reset-btn {
          background: #198754;
          color: #fff;
          border-radius: 30px;
          padding: 14px 0;
          font-weight: 700;
          font-size: 1.1rem;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .btn-primary.reset-btn:hover:not(:disabled) {
          background: rgb(112,168,77);
        }
        .btn-primary.reset-btn:disabled {
          background: rgb(112,168,77);
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* 🔙 Back to Login */
        .back-login {
          margin-top: 30px;
        }
        .login-link {
          color: #198754;
          font-weight: 600;
          text-decoration: underline;
          transition: color 0.3s ease;
        }
        .login-link:hover {
          color: rgb(112,168,77);
        }
      `}</style>
    </div>
  );
};

export default PasswordReset;
