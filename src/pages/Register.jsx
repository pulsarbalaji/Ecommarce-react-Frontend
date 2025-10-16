import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaEnvelope, FaMobileAlt, FaLock } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import api from "../utils/base_url";

const Register = () => {
  const [registerMethod, setRegisterMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Validate email format
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // Validate password (min 6 characters)
  const isValidPassword = (password) =>
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/.test(password);
  // Validate phone (10 digits)
  const isValidPhone = (phone) => /^[0-9]{10,15}$/.test(phone);

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) return toast.error("Please enter a valid email");
    if (!isValidPassword(password)) {
  return toast.error(
    "Password must have at least 1 uppercase letter, 1 number, 1 special character, and minimum 6 characters"
  );
}

    setLoading(true);
    try {
      const res = await api.post("register/email-step1/", { email, password });
      toast.success(res.data.message || "OTP sent to email");
      sessionStorage.setItem("session_id", res.data.session_id);
      sessionStorage.setItem("email", email);
      sessionStorage.setItem("password", password);
      navigate("/verification", { state: { type: "email" } });
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.response?.data?.message || "Email registration failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneRegister = async (e) => {
    e.preventDefault();
    if (!isValidPhone(phone)) return toast.error("Please enter a valid phone number");

    setLoading(true);
    try {
      const res = await api.post("phone-register-step1/", { phone });
      toast.success(res.data.message || "OTP sent to phone");
      sessionStorage.setItem("session_id", res.data.session_id);
      sessionStorage.setItem("phone", phone);
      navigate("/verification", { state: { type: "phone" } });
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.response?.data?.message || "Phone registration failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await api.post("google/", { token: idToken });
      sessionStorage.setItem("access_token", res.data.access);
      sessionStorage.setItem("refresh_token", res.data.refresh);
      toast.success("Google registration successful!");
      navigate("/dashboard");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.response?.data?.message || error.message || "Google registration failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="register-card"
      >
        <h4 className="register-title">Create Your Account</h4>

        <div className="register-method-toggle">
          <motion.button
            className={registerMethod === "email" ? "active" : ""}
            onClick={() => setRegisterMethod("email")}
            whileTap={{ scale: 0.95 }}
            aria-label="Email Register"
          >
            <FaEnvelope size={24} />
          </motion.button>
          <motion.button
            className={registerMethod === "phone" ? "active" : ""}
            onClick={() => setRegisterMethod("phone")}
            whileTap={{ scale: 0.95 }}
            aria-label="Phone Register"
          >
            <FaMobileAlt size={24} />
          </motion.button>
        </div>

        {registerMethod === "email" && (
          <motion.form onSubmit={handleEmailRegister} className="register-form">
            <div className="floating-input">
              <input
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label>
                <FaEnvelope /> Email
              </label>
            </div>

            <div className="floating-input">
              <input
                type="password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label>
                <FaLock /> Password
              </label>
            </div>

            <button type="submit" className="btn btn-primary register-btn" disabled={loading}>
              {loading ? "Please wait..." : "Register"}
            </button>
          </motion.form>
        )}

        {registerMethod === "phone" && (
          <motion.form onSubmit={handlePhoneRegister} className="register-form">
            <div className="floating-input">
              <input
                type="tel"
                placeholder=" "
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <label>
                <FaMobileAlt /> Phone Number
              </label>
            </div>

            <button type="submit" className="btn btn-primary register-btn" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </motion.form>
        )}

        <button
          onClick={handleGoogleRegister}
          className="btn btn-google-register"
          disabled={loading}
          aria-label="Register with Google"
        >
          <FcGoogle size={24} />
          Register with Google
        </button>

        <p className="login-prompt">
          Already have an account?{" "}
          <Link to="/login" className="text-decoration-underline text-themed">
            Login
          </Link>
        </p>
      </motion.div>

      <style>{`
        .register-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #fffaf4;
          padding: 20px;
        }
        .register-card {
          background: #fcf8f8;
          border: 1.5px solid #f1e6d4;
          border-radius: 20px;
          box-shadow: 0 6px 18px rgba(122, 86, 58, 0.16);
          padding: 50px 35px;
          width: 100%;
          max-width: 440px;
          color: #7a563a;
          font-weight: 600;
          text-align: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .register-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 30px;
          color: #7a563a;
        }
        .register-method-toggle {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 30px;
        }
        .register-method-toggle button {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 2px solid #7a563a;
          background: #fffaf4;
          color: #7a563a;
          cursor: pointer;
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: background-color 0.3s ease;
        }
        .register-method-toggle button.active {
          background-color: #7a563a;
          color: #fff;
          box-shadow: 0 0 10px rgba(122, 86, 58, 0.5);
        }
        .register-method-toggle button:hover:not(.active) {
          background-color: #f6ede0;
        }
        .register-form {
          display: flex;
          flex-direction: column;
          gap: 22px;
          text-align: left;
        }
        .floating-input {
          position: relative;
        }
        .floating-input input {
          width: 100%;
          border-radius: 15px;
          border: 1.5px solid #f1e6d4;
          background-color: #fffaf4;
          font-weight: 600;
          font-size: 1.1rem;
          color: #7a563a;
          padding: 14px 14px 14px 42px;
          box-shadow: inset 0 0 6px rgba(245, 245, 245, 0.5);
          outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .floating-input input:focus {
          border-color: #7a563a;
          box-shadow: 0 0 10px rgba(122, 86, 58, 0.4);
        }
        .floating-input input::placeholder {
          color: transparent;
        }
        .floating-input label {
          position: absolute;
          left: 42px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          font-weight: 600;
          color: #7a563a;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          user-select: none;
        }
        .floating-input input:focus + label,
        .floating-input input:not(:placeholder-shown) + label {
          top: 5px;
          font-size: 0.85rem;
          color: #bf9f71;
          font-weight: 700;
          background: #fffaf4;
          padding: 0 8px;
          border-radius: 8px;
          left: 15px;
        }
        .btn-primary.register-btn {
          background-color: #7a563a;
          color: #fff;
          border-radius: 30px;
          padding: 15px 0;
          font-weight: 700;
          font-size: 1.2rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(122, 86, 58, 0.3);
          transition: background-color 0.3s ease;
        }
        .btn-primary.register-btn:hover,
        .btn-primary.register-btn:focus {
          background-color: #68492f;
          outline: none;
          box-shadow: 0 8px 24px rgba(122, 86, 58, 0.5);
        }
        .btn-google-register {
          margin-top: 35px;
          background-color: transparent;
          border: 2px solid #7a563a;
          border-radius: 30px;
          padding: 12px 0;
          font-weight: 700;
          font-size: 1.15rem;
          color: #7a563a;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          transition: background-color 0.3s ease, color 0.3s ease;
          width: 100%;
        }
        .btn-google-register:hover {
          background-color: #7a563a;
          color: #fff;
        }
        .google-icon {
          margin-left: -6px;
        }
        .login-prompt {
          margin-top: 38px;
          text-align: center;
          font-weight: 600;
          color: #7a563a;
          font-size: 1rem;
        }
        .login-prompt a {
          color: #bf9f71;
          font-weight: 700;
          text-decoration: underline;
          transition: color 0.3s ease;
        }
        .login-prompt a:hover {
          color: #68492f;
        }
        @media (max-width: 768px) {
          .register-card{
            padding: 40px 25px;
            max-width: 100%;
          }
          .register-title {
            font-size: 1.6rem;
          }
          .btn-primary.register-btn,
          .btn-google-register {
            font-size: 1rem;
            padding: 12px 0;
          }
          .register-method-toggle button {
            width: 50px;
            height: 50px;
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;
