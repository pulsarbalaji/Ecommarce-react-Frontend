import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../utils/base_url";
import toast from "react-hot-toast";

const PasswordResetConfirm = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password validation
  const validatePassword = (pass) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!validatePassword(password)) {
      toast.error(
        "Password must be at least 8 characters, include uppercase, lowercase, number & special character."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("set-password/", { uid, token, password });

      if (res.data.status === true) {
        toast.success("Password reset successful! Please login.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(res.data.message || "Password reset failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Invalid or expired link. Please request again.");
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
        <h3 className="reset-title">Set New Password</h3>
        <p className="reset-subtitle">Enter your new password below.</p>

        <form onSubmit={handleSubmit} className="reset-form">
          <div className="floating-input password-input">
            <input
              type={showPassword ? "text" : "password"}
              placeholder=" "
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>
              <FaLock /> New Password
            </label>
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="floating-input password-input">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder=" "
              value={confirmPassword}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <label>
              <FaLock /> Confirm Password
            </label>
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {/* {showConfirmPassword ? <FaEyeSlash /> : <FaEye />} */}
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary reset-btn"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="back-login">
          <Link to="/login" className="login-link">
            ← Back to Login
          </Link>
        </div>
      </motion.div>

      {/* 🌿 Theme Styles */}
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
        .password-input { position: relative; }
        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          color: #000000ff;
          cursor: pointer;
          font-size: 1.25rem;
        }
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

export default PasswordResetConfirm;
