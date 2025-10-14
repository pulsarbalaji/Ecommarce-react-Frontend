import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaMobileAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { auth, googleProvider } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/base_url";
import { signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [loginMethod, setLoginMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult,] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Email login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("customer/login/", { email, password });
      login(res.data);
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await api.post("google/login/", { token: idToken });
      login(res.data);
      toast.success("Logged in with Google!");
      navigate("/");
    } catch {
      toast.error("Google login failed.");
    }
  };

 // Phone login using backend
const handlePhoneLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await api.post("phone-login-step1/", { phone });
    toast.success(res.data.message || "OTP sent!");
    sessionStorage.setItem("session_id", res.data.session_id);
    navigate("/verification", { state: { type: "phone" } });
  } catch (error) {
    toast.error(error.response?.data?.message || "Phone login failed");
  }
};


  // OTP verification
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const res = await api.post("phone-login-step1/", {
        session_id: userCredential.verificationId,
        otp,
      });
      login(res.data);
      toast.success("Phone login successful!");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "OTP verification failed");
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
        <h5 className="login-title">Welcome to E-commerce Website</h5>

        {/* Login method toggles */}
        <div className="login-method-toggle">
          <button
            className={loginMethod === "email" ? "active" : ""}
            onClick={() => setLoginMethod("email")}
            aria-label="Email Login"
          >
            <FaEnvelope size={20} />
          </button>
          <button
            className={loginMethod === "phone" ? "active" : ""}
            onClick={() => setLoginMethod("phone")}
            aria-label="Phone Login"
          >
            <FaMobileAlt size={20} />
          </button>
        </div>

        {/* Email login */}
        {loginMethod === "email" && (
          <motion.form onSubmit={handleEmailLogin} className="login-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="floating-input">
              <input
                type="email"
                id="email"
                placeholder=" "
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="email">
                <FaEnvelope /> Email
              </label>
            </div>

            <div className="floating-input password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder=" "
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="password">
                <FaLock /> Password
              </label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button type="submit" className="btn btn-primary login-btn">
              Login
            </button>
          </motion.form>
        )}

        {/* Phone login without Recaptcha */}
        {loginMethod === "phone" && (
          <>
            {!confirmationResult ? (
              <motion.form onSubmit={handlePhoneLogin} className="login-form">
                <div className="floating-input">
                  <input
                    type="tel"
                    id="phone"
                    placeholder=" "
                    value={phone}
                    required
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <label htmlFor="phone">
                    <FaMobileAlt /> Phone Number
                  </label>
                </div>

                <button type="submit" className="btn btn-primary login-btn">
                  Send OTP
                </button>
              </motion.form>
            ) : (
              <motion.form onSubmit={handleOtpVerify} className="login-form">
                <div className="floating-input">
                  <input
                    type="text"
                    id="otp"
                    placeholder=" "
                    value={otp}
                    required
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <label htmlFor="otp">OTP</label>
                </div>

                <button type="submit" className="btn btn-primary login-btn">
                  Verify OTP
                </button>
              </motion.form>
            )}
          </>
        )}

        {/* Google login */}
        <button onClick={handleGoogleLogin} className="btn btn-google-login">
          <FcGoogle size={24} className="google-icon" />
          Login with Google
        </button>

        <p className="register-prompt">
          New here? <Link to="/register" className="register-link">Register</Link>
        </p>
      </motion.div>

      <style>{`
        .login-wrapper {
          min-height: 100vh;
          background: #fffaf4;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        .login-card {
          background: #fcf8f8;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 20px;
          box-shadow: 0 10px 25px rgba(122, 86, 58, 0.15);
          padding: 40px 30px;
          width: 100%;
          max-width: 420px;
          color: #7a563a;
          font-weight: 600;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          text-align: center;
        }
        .login-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 30px;
        }
        .login-method-toggle {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 30px;
        }
        .login-method-toggle button {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          border: 2px solid #7a563a;
          background: #fffaf4;
          color: #7a563a;
          cursor: pointer;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease;
        }
        .login-method-toggle button.active {
          background-color: #7a563a;
          color: #fff;
          box-shadow: 0 0 10px rgba(122, 86, 58, 0.5);
        }
        .login-method-toggle button:hover:not(.active) {
          background-color: #f6ede0;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 25px;
          text-align: left;
        }
        .floating-input {
          position: relative;
        }
        .floating-input input {
          width: 100%;
          padding: 14px 14px 14px 42px;
          font-weight: 600;
          font-size: 1.1rem;
          border-radius: 15px;
          border: 1.5px solid #f1e6d4;
          background-color: #fffaf4;
          color: #7a563a;
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
          transition: 0.3s ease all;
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
        .password-input {
          position: relative;
        }
        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          color: #7a563a;
          cursor: pointer;
          font-size: 1.25rem;
          outline: none;
        }
        .btn-primary.login-btn {
          background-color: #7a563a;
          color: #fff;
          border-radius: 30px;
          padding: 14px 0;
          font-weight: 700;
          font-size: 1.2rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(122, 86, 58, 0.3);
          transition: background-color 0.3s ease;
        }
        .btn-primary.login-btn:hover,
        .btn-primary.login-btn:focus {
          background-color: #68492f;
          outline: none;
          box-shadow: 0 8px 24px rgba(122, 86, 58, 0.5);
        }
        .btn-google-login {
          margin-top: 30px;
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
        }
        .btn-google-login:hover {
          background-color: #7a563a;
          color: #fff;
        }
        .google-icon {
          margin-left: -4px;
        }
        .register-prompt {
          margin-top: 40px;
          text-align: center;
          font-weight: 600;
          color: #7a563a;
          font-size: 1rem;
        }
        .register-prompt a {
          color: #bf9f71;
          font-weight: 700;
          text-decoration: underline;
          transition: color 0.3s ease;
        }
        .register-prompt a:hover {
          color: #68492f;
        }
        @media (max-width: 768px) {
          .login-wrapper {
            padding: 20px;
          }
          .login-card {
            padding: 30px 20px;
          }
          .login-title {
            font-size: 1.6rem;
          }
          .btn-primary.login-btn,
          .btn-google-login {
            font-size: 1rem;
            padding: 12px 0;
          }
          .login-method-toggle button {
            width: 50px;
            height: 50px;
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
