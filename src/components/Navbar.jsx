import React, { useEffect, useRef, useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileUpdateForm from "../pages/ProfileUpdateForm";
import api from "../utils/base_url";
import { AuthContext } from "../context/AuthContext";
import WhatsAppWidget from "../pages/WhatsAppWidget";
import InstagramWidget from "../pages/Instagramwidget";
import '../styles/index.css';


const Navbar = () => {
  const state = useSelector((state) => state.handleCart);
  const navigate = useNavigate();
  const menuRef = useRef();
  const { user, setUser } = useContext(AuthContext);
  const [openMenu, setOpenMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleNavLinkClick = () => isMenuOpen && setIsMenuOpen(false);

  const handleLogout = async () => {
    const refresh = sessionStorage.getItem("refresh");
    try {
      await api.post("logout/", { refresh });
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
    sessionStorage.clear();
    setUser(null);
    navigate("/");
    handleNavLinkClick();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getProfileImage = (user) => {
    const cd = user.customer_details;
    if (!cd) return "../assets/Profile-image.jpg";
    let img = cd.profile_image;
    if (!img) return "../assets/Profile-image.jpg";
    if (user.login_method === "google") {
      if (img.includes("%3A") || img.includes("%2F")) {
        let decoded = decodeURIComponent(img.replace("/media/", ""));
        if (decoded.startsWith("https:/") && !decoded.startsWith("https://")) {
          decoded = decoded.replace("https:/", "https://");
        }
        return decoded;
      }
      if (img.startsWith("http")) return img;
    }
    if (!img.startsWith("http")) {
      img = `${process.env.REACT_APP_API_URL}${img}`;
    }
    return img;
  };

  return (
    <>
      <nav
        className="navbar navbar-expand-lg sticky-top shadow-sm"
        style={{
          backgroundColor: "#fff9f3",
          borderBottom: "2px solid #e6d2b5",
        }}
      >
        <div className="container py-2">
          {/* Brand */}
          <NavLink
            className="navbar-brand fw-bold fs-3 text-success d-flex align-items-center"
            to="/"
            onClick={handleNavLinkClick}
            style={{ gap: "8px" }}
          >
            <img
              src={`${process.env.PUBLIC_URL}/Logo.jpeg`}
              alt="Logo"
              style={{ height: "32px", width: "auto" }}
            />
            <span style={{ color: "rgb(112, 168, 77)" }}>Vallalar</span> Natural's
          </NavLink>

          <WhatsAppWidget inNavbar={true} />
          <InstagramWidget inNavbar={true} />

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler"
            type="button"
            aria-controls="navbarSupportedContent"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
            onClick={toggleMenu}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Menu Items */}
          <div
            className={`collapse navbar-collapse${isMenuOpen ? " show" : ""}`}
            id="navbarSupportedContent"
          >
            <ul className="navbar-nav m-auto my-2 text-center gap-3">
              {["Home", "Product", "About", "Contact"].map((name) => (
                <li className="nav-item" key={name}>
                  <NavLink
                    className="nav-link fw-semibold"
                    to={`/${name === "Home" ? "" : name.toLowerCase()}`}
                    style={({ isActive }) => ({
                      color: isActive ? "rgb(112, 168, 77)" : "#000000ff",
                      borderBottom: isActive
                        ? "2px solid rgb(112, 168, 77)"
                        : "none",
                      transition: "all 0.3s ease",
                    })}
                    onClick={handleNavLinkClick}
                  >
                    {name}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Right Section */}
            <div className="d-flex align-items-center text-center flex-wrap gap-2">
              {user ? (
                <div className="d-flex align-items-center" ref={menuRef}>
                  {/* Cart Button */}
                  <NavLink
                    to="/cart"
                    className="btn position-relative me-3"
                    style={{
                      borderRadius: "30px",
                      backgroundColor: "rgb(112, 168, 77)",
                      color: "#fff",
                      padding: "8px 18px",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                    onClick={handleNavLinkClick}
                  >
                    <i className="fa fa-shopping-cart me-2"></i>
                    Cart
                    {state.length > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {state.length}
                      </span>
                    )}
                  </NavLink>

                  {/* Profile Dropdown */}
                  <div className="position-relative">
                    <button
                      className="btn d-flex align-items-center user-profile-btn"
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "rgba(0, 0, 0, 1)",
                        fontWeight: 600,
                        fontSize: "1rem",
                        whiteSpace: "nowrap",
                      }}
                      onClick={() => setOpenMenu(!openMenu)}
                    >
                      <img
                        src={getProfileImage(user)}
                        alt={user.customer_details?.full_name || "User"}
                        referrerPolicy="no-referrer"
                        className="rounded-circle me-2 border"
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                          borderColor: "#e8d0b9",
                          borderWidth: 2,
                        }}
                      />
                      <span>{user.customer_details?.full_name || "User"}</span>
                      <i
                        className="fa fa-chevron-down ms-2"
                        style={{ fontSize: "0.8rem" }}
                      ></i>
                    </button>

                    {openMenu && (
                      <div
                        className="dropdown-menu-themed position-absolute"
                        style={{
                          top: "50px",
                          right: 0,
                          minWidth: "180px",
                          zIndex: 1000,
                        }}
                      >
                        <button
                          className="dropdown-item-themed text-start fw-semibold"
                          data-bs-toggle="modal"
                          data-bs-target="#profileModal"
                          onClick={() => setOpenMenu(false)}
                        >
                          Profile
                        </button>
                        <button
                          className="dropdown-item-themed text-start fw-semibold"
                          onClick={() => {
                            navigate("/orderhistory");
                            setOpenMenu(false);
                          }}
                        >
                          Order History
                        </button>
                        <button
                          className="dropdown-item-themed text-start fw-semibold"
                          onClick={() => {
                            navigate("/favoriteProducts");
                            setOpenMenu(false);
                          }}
                        >
                          Favorite Products
                        </button>
                        <button
                          className="dropdown-item-themed dropdown-item-danger text-start fw-semibold"
                          onClick={() => {
                            handleLogout();
                            setOpenMenu(false);
                          }}
                        >
                          Logout
                        </button>

                        <style>{`
                          .dropdown-menu-themed {
                            border: 1.5px solid #f1e6d4;
                            background-color: #fffaf4;
                            box-shadow: 0 6px 18px rgba(112, 168, 77, 0.2);
                            border-radius: 14px;
                            padding: 10px 0;
                          }
                          .dropdown-item-themed {
                            background: none;
                            color: rgb(112, 168, 77);
                            padding: 10px 24px;
                            border-radius: 10px;
                            border: none;
                            width: 100%;
                            text-align: left;
                            font-weight: 600;
                            font-size: 1rem;
                            transition: background-color 0.28s, color 0.28s;
                          }
                          .dropdown-item-themed:hover, .dropdown-item-themed:focus {
                            background-color: rgb(112, 168, 77) !important;
                            color: #fff !important;
                          }
                          .dropdown-item-danger {
                            color: #b33a3a !important;
                          }
                          .dropdown-item-danger:hover, .dropdown-item-danger:focus {
                            background-color: #b33a3a !important;
                            color: #fff !important;
                          }
                          .user-profile-btn:focus {
                            outline: none;
                            background: #fffaf4;
                          }
                            
                        `}</style>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="auth-buttons">
                  <NavLink
                    to="/login"
                    className="btn btn-outline-themed"
                    style={{
                      borderRadius: "30px",
                      border: "1.5px solid rgb(112, 168, 77)",
                      color: "rgb(112, 168, 77)",
                      fontWeight: 500,
                      padding: "8px 18px",
                      whiteSpace: "nowrap",
                    }}
                    onClick={handleNavLinkClick}
                  >
                    <i className="fa fa-sign-in-alt me-1"></i> Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="btn btn-themed"
                    style={{
                      borderRadius: "30px",
                      backgroundColor: "rgb(112, 168, 77)",
                      color: "#fff",
                      fontWeight: 500,
                      padding: "8px 18px",
                      whiteSpace: "nowrap",
                    }}
                    onClick={handleNavLinkClick}
                  >
                    <i className="fa fa-user-plus me-1"></i> Register
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {user && <ProfileUpdateForm />}

      <style>{`
        .btn-themed {
          background-color: rgb(112, 168, 77);
          color: #fff !important;
          border-radius: 25px;
          font-weight: 600;
          padding: 8px 18px;
          border: none;
          font-size: 1rem;
          transition: background-color 0.3s ease;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(112, 168, 77, 0.25);
        }
        .btn-themed:hover,
        .btn-themed:focus {
          background-color: rgb(95, 142, 66);
          box-shadow: 0 0 10px rgba(112, 168, 77, 0.6);
        }
        .btn-outline-themed {
          color: rgb(112, 168, 77) !important;
          border: 1.5px solid rgb(112, 168, 77) !important;
          border-radius: 25px;
          font-weight: 600;
          padding: 8px 18px;
          font-size: 1rem;
          background-color: transparent;
          transition: all 0.3s ease;
        }
        .btn-outline-themed:hover,
        .btn-outline-themed:focus {
          background-color: rgb(112, 168, 77) !important;
          color: #fff !important;
        }
        .auth-buttons {
          display: flex;
          gap: 8px;
        }
        @media (max-width: 576px) {
          .auth-buttons {
            flex-direction: row !important;
            width: 100%;
          }
          .auth-buttons .btn {
            width: 50% !important;
            font-size: 0.95rem;
            padding: 8px 0;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
