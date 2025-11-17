import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaMobileAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/base_url";

const Login = () => {
  const [loginMethod, setLoginMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Validation helpers
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) => /^[0-9]{10,15}$/.test(phone);
  const isValidPassword = (pass) => pass.length >= 6;

  // Email login
  const handleEmailLogin = async (e) => {
  e.preventDefault();
  try {
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email.");
      return;
    }
    if (!isValidPassword(password)) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const res = await api.post("customer/login/", { email, password });
    login(res.data);
    toast.success("Logged in successfully!");
    navigate("/");
  } catch (error) {
    toast.error(error.response?.data?.error || "Login failed");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const msg = sessionStorage.getItem("redirect_toast");
  if (msg) {
    toast.success(msg, { duration: 3000 });
    sessionStorage.removeItem("redirect_toast"); // remove after showing
  }
}, []);

  // Phone login
  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    if (!isValidPhone(phone)) return toast.error("Please enter a valid phone number.");

    setLoading(true);
    try {
      const res = await api.post("phone-login-step1/", { phone });
      sessionStorage.setItem("session_id", res.data.session_id);
      sessionStorage.setItem("phone", phone);
      toast.success(res.data.message || "OTP sent successfully!");
      navigate("/verification", { state: { type: "phone" } });
    } catch (error) {
      const msg =
        error.response?.data?.error || error.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await api.post("google/login/", { token: idToken });
      login(res.data);
      toast.success("Logged in with Google!");
      navigate("/");
    } catch {
      toast.error("Google login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="login-card"
      >
        <h5 className="login-title">Welcome Back!</h5>

        {/* Login method toggle */}
        <div className="login-method-toggle">
          <button
            className={loginMethod === "email" ? "active" : ""}
            onClick={() => setLoginMethod("email")}
          >
            <FaEnvelope size={20} />
          </button>
          <button
            className={loginMethod === "phone" ? "active" : ""}
            onClick={() => setLoginMethod("phone")}
          >
            <FaMobileAlt size={20} />
          </button>
        </div>

        {/* Email Login */}
        {loginMethod === "email" && (
          <motion.form  className="login-form">
            <div className="floating-input">
              <input
                type="email"
                placeholder=""
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>
                <FaEnvelope /> Email
              </label>
            </div>

            <div className="floating-input password-input">
              <input
                type={showPassword ? "text" : "password"}
                placeholder=""
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>
                <FaLock /> Password
              </label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
             <div className="forgot-password">
              <Link to="/passwordreset">Forgot Password?</Link>
            </div>

            <button onClick={handleEmailLogin} className="btn btn-primary login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </motion.form>
        )}

        {/* Phone Login */}
        {loginMethod === "phone" && (
          <motion.form onSubmit={handlePhoneLogin} className="login-form">
            <div className="floating-input">
              <input
                type="tel"
                placeholder=" "
                value={phone}
                required
                onChange={(e) => setPhone(e.target.value.replace(/\D/, ""))}
                maxLength={10}
              />
              <label>
                <FaMobileAlt /> Phone Number
              </label>
            </div>

            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </motion.form>
        )}

        {/* Google Login */}
        <button onClick={handleGoogleLogin} className="btn btn-google-login" disabled={loading}>
          <FcGoogle size={24} />
          {loading ? "Please wait..." : "Login with Google"}
        </button>

        <p className="register-prompt">
          New here?{" "}
          <Link to="/register" className="register-link">
            Register
          </Link>
        </p>
      </motion.div>

      {/* 🌿 Green Theme Styles */}
      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #fffaf4;
          padding: 20px;
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border-radius: 20px;
          padding: 40px 30px;
          box-shadow: 0 10px 25px rgba(25, 135, 84, 0.2);
          text-align: center;
        }
        .login-title {
          font-size: 1.8rem;
          margin-bottom: 30px;
          font-weight: 700;
          color: #000000ff;
        }
        .login-method-toggle {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 30px;
        }
        .forgot-password {
          text-align: right;
          margin-top: -15px;
        }
        .forgot-password a {
          color: #198754;
          font-weight: 600;
          text-decoration: underline;
          font-size: 0.95rem;
        }
        .login-method-toggle button {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          border: 2px solid #198754;
          background: #e8f8e8;
          color: #198754;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 24px;
          transition: 0.3s;
        }
        .login-method-toggle button.active {
          background: #198754;
          color: #fff;
        }
        .login-form {
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

        /* ✅ Hover effect for Login Button */
        .btn-primary.login-btn {
          background: #198754;
          color: #fff;
          border-radius: 30px;
          padding: 14px 0;
          font-weight: 700;
          font-size: 1.2rem;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .btn-primary.login-btn:hover:not(:disabled) {
          background: rgb(112,168,77);
        }
        .btn-primary.login-btn:disabled {
          background: rgb(112,168,77);
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-google-login {
          margin-top: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 12px 0;
          border-radius: 30px;
          border: 2px solid #198754;
          background: transparent;
          color: #198754;
          font-weight: 700;
          cursor: pointer;
        }
        .btn-google-login:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .register-prompt {
          margin-top: 40px;
          color: #000000ff;
          font-weight: 600;
        }
        .register-link {
          color: #198754;
          font-weight: 700;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Login;
