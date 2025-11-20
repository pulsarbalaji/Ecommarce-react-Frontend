import React, { useEffect, useRef, useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileUpdateForm from "../pages/ProfileUpdateForm";
import api from "../utils/base_url";
import { AuthContext } from "../context/AuthContext";
import WhatsAppWidget from "../pages/WhatsAppWidget";
import InstagramWidget from "../pages/Instagramwidget";
import '../styles/index.css';
import toast from "react-hot-toast";
import NotificationPanel from "./notificationsPanel";

const Navbar = () => {
  const state = useSelector((state) => state.handleCart);
  const navigate = useNavigate();
  const menuRef = useRef();
  const { user, setUser } = useContext(AuthContext);
  const [openMenu, setOpenMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [feedbackProduct, setFeedbackProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");




  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);


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

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get(`customer-notifications/${user.customer_details.id}/`);
        if (res.data.success) {
          setNotifications(res.data.data || []);
          setUnreadCount(res.data.total || 0);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    // Optional: Auto refresh every 30 sec
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const openFeedbackModal = async (item) => {
    const productId = item?.product || item?.product_id || item?.id;

    if (!productId) {
      toast.error("Invalid product");
      return;
    }

    const productName = item?.product_name || item?.product?.product_name || "Product";

    setFeedbackProduct({ id: productId, name: productName });
    setRating(0);
    setComment("");
    setShowModal(true);

    // 🟢 Try fetching existing feedback for this product
    try {
      const res = await api.get(`feedback/${productId}/`); // example endpoint: GET /feedback/5/
      if (res.data?.data) {
        const fb = res.data.data;
        setRating(Number(fb.rating || 0));
        setComment(fb.comment || "");
      }
    } catch (err) {
      // No existing feedback → ignore
      if (err.response?.status !== 404) {
        console.warn("Feedback fetch error:", err);
      }
    }
  };
  const submitFeedback = async () => {
    if (!feedbackProduct?.id) return toast.error("Invalid product");
    if (!rating) return toast.error("Please select a star rating");
    if (comment.trim().length > 1000)
      return toast.error("Comment can’t exceed 1000 characters");

    try {
      const payload = { rating, comment };
      await api.post(`feedback/${feedbackProduct.id}/`, payload);
      toast.success("Feedback submitted successfully!");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit feedback");
    }
  };


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
        className="navbar navbar-expand-lg sticky-top shadow-sm d-none d-lg-flex"

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
              {["Home", "Products", "About", "Contact"].map((name) => (
                <li className="nav-item" key={name}>
                  <NavLink
                    className="nav-link fw-semibold"
                    to={
                      name === "Home"
                        ? "/"
                        : name === "Products"
                          ? "/product"  // 👈 FIXED ROUTE FOR PRODUCTS PAGE
                          : `/${name.toLowerCase()}`
                    }
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


              {/* 🔍 Search Button */}
              <button
                className="nav-action-btn me-2"
                onClick={() => navigate("/search")}
                title="Search Products"
              >
                <i className="fa fa-search"></i>
                <span>Search</span>
              </button>

              {/* ❤️ Wishlist Button (only if logged in) */}
              {user && (
                <button
                  className="nav-action-btn me-2"
                  onClick={() => navigate("/favoriteProducts")}
                  title="My Favorites"
                >
                  <i className="fa fa-heart text-danger"></i>
                  <span>Wishlist</span>
                </button>
              )}
              {user && (
                <button
                  className="nav-action-btn me-2 position-relative"
                  onClick={() => setNotifPanelOpen(true)}
                  title="Notifications"
                >
                  <i className="fa fa-bell"></i>
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: "0.65rem" }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}

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
      {/* ✅ Mobile Navbar (only shows on small screens) */}
      <div
        className="d-flex d-lg-none justify-content-between align-items-center px-3 py-2 sticky-top"
        style={{
          backgroundColor: "#fff9f3",
          borderBottom: "2px solid #e6d2b5",
          height: "70px",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          {/* Hamburger */}
          <button
            className="btn p-0"
            onClick={toggleDrawer}
            style={{ background: "transparent", border: "none" }}
          >
            <i className="fa fa-bars" style={{ fontSize: "1.4rem", color: "#198754" }}></i>
          </button>

          {/* Search */}
          <button
            className="btn p-0"
            style={{ background: "transparent", border: "none" }}
            onClick={() => navigate("/search")}
          >
            <i className="fa fa-search" style={{ fontSize: "1.3rem", color: "#198754" }}></i>
          </button>

        </div>

        <div className="d-flex align-items-center gap-3">
          <WhatsAppWidget inNavbar={true} />
          <InstagramWidget inNavbar={true} />
          <button
            className="btn p-0"
            onClick={() => navigate("/favoriteProducts")}
            style={{ background: "transparent", border: "none" }}
          >
            <i className="fa fa-heart" style={{ fontSize: "1.3rem", color: "#e63946" }}></i>
          </button>
          {user && (
            <button
              className="btn p-0 position-relative"
              onClick={() => setNotifPanelOpen(true)}
              style={{ background: "transparent", border: "none" }}
            >
              <i className="fa fa-bell" style={{ fontSize: "1.3rem", color: "#198754" }}></i>
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: "0.65rem" }}>
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          <button
            className="btn p-0 position-relative"
            onClick={() => navigate("/cart")}
            style={{ background: "transparent", border: "none" }}
          >
            <i className="fa fa-shopping-cart" style={{ fontSize: "1.3rem", color: "#198754" }}></i>
            {state.length > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: "0.65rem" }}
              >
                {state.length}
              </span>
            )}
          </button>
        </div>
      </div>
      {/* ✅ Mobile Drawer (Left Slide) */}
      {isDrawerOpen && (
        <>
          <div
            className="drawer-backdrop"
            onClick={() => setIsDrawerOpen(false)}
          ></div>

          <div className="drawer-menu">
            <button
              className="drawer-close"
              onClick={() => setIsDrawerOpen(false)}
            >
              ×
            </button>

            <div className="text-center mt-3">
              <img
                src={`${process.env.PUBLIC_URL}/Logo.jpeg`}
                alt="Logo"
                style={{ height: "50px" }}
              />
              <h5 className="fw-bold mt-2 brand-title">
                <span style={{ color: "rgb(112, 168, 77)" }} >Vallalar</span>{" "}
                <span style={{ color: "#198754" }} >Natural’s</span>
              </h5>

            </div>

            {user && (
              <div className="text-center mt-3">
                <img
                  src={getProfileImage(user)}
                  alt="Profile"
                  className="rounded-circle border"
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "cover",
                    borderColor: "#e6d2b5",
                  }}
                />
                <p className="mt-2 fw-semibold">
                  {user.customer_details?.full_name || "User"}
                </p>
              </div>
            )}

            <ul className="list-unstyled mt-4">
              {["Home", "Products", "About", "Contact"].map((name) => (
                <li key={name}>
                  <NavLink
                    to={
                      name === "Home"
                        ? "/"
                        : name === "Products"
                          ? "/product"
                          : `/${name.toLowerCase()}`
                    }
                    className="drawer-link-item"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    {name}
                  </NavLink>
                </li>
              ))}
            </ul>

            <hr />

            {user ? (
              <>
                <button
                  className="drawer-link-item"
                  data-bs-toggle="modal"
                  data-bs-target="#profileModal"
                  onClick={() => setOpenMenu(false)}
                >
                  Profile Details
                </button>
                <button
                  className="drawer-link-item"
                  onClick={() => {
                    navigate("/orderhistory");
                    setIsDrawerOpen(false);
                  }}
                >
                  Order History
                </button>
                <button
                  className="drawer-link-item logout-link"
                  onClick={() => {
                    handleLogout();
                    setIsDrawerOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="drawer-link-item"
                  onClick={() => {
                    navigate("/login");
                    setIsDrawerOpen(false);
                  }}
                >
                  🔑 Login
                </button>
                <button
                  className="drawer-link-item"
                  onClick={() => {
                    navigate("/register");
                    setIsDrawerOpen(false);
                  }}
                >
                  ✍️ Register
                </button>
              </>
            )}
          </div>
        </>
      )}

      {user && <ProfileUpdateForm />}




      <style>{`

      .nav-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #000;
  background: transparent;
  border: none;
  font-size: 1rem;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.25s ease;
}

.nav-action-btn i {
  font-size: 1.15rem;
  color: #198754;
  transition: transform 0.2s ease;
}

.nav-action-btn span {
  font-size: 0.95rem;
}

.nav-action-btn:hover {
  background-color: rgba(112, 168, 77, 0.1);
  transform: translateY(-1px);
}

.nav-action-btn:hover i {
  transform: scale(1.1);
  color: #70a84d;
}

.nav-action-btn:active {
  transform: scale(0.98);
  background-color: rgba(112, 168, 77, 0.15);
}

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

        /* === Drawer Styles === */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1040;
}
.drawer-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background-color: #fffaf4;
  border-right: 2px solid #e6d2b5;
  z-index: 1050;
  padding: 20px;
  animation: slideInLeft 0.3s ease forwards;
  overflow-y: auto;
}
.drawer-close {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.6rem;
  color: #198754;
}
@keyframes slideInLeft {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.drawer-link-item {
  display: block;
  text-decoration: none !important;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  padding: 10px 0;
  font-weight: 600;
  color: #198754;
  border-bottom: 1px solid #f1e6d4;
}
.drawer-link-item:hover {
  color: #70a84d;
}
.logout-link {
  color: #b33a3a;
}

/* Notification Slide Panel */
.notif-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 2000;
}

.notif-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background: #fffaf4;
  border-left: 2px solid #e6d2b5;
  z-index: 2100;
  animation: slideInRight 0.3s ease forwards;
  display: flex;
  flex-direction: column;
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.notif-header {
  padding: 15px;
  border-bottom: 1px solid #e6d2b5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clear-btn {
  border: none;
  background: #b33a3a;
  color: white;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.notif-body {
  overflow-y: auto;
  height: calc(100vh - 60px);
}

.notif-item {
  padding: 12px;
  border-bottom: 1px solid #e6d2b5;
  cursor: pointer;
}

.notif-item:hover {
  background: #f3eee6;
}

.notif-item strong {
  color: #198754;
}

.notif-time {
  font-size: 0.75rem;
  color: #888;
}



  /* === Feedback Modal === */
  .feedback-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .feedback-content {
    background: white;
    width: 90%;
    max-width: 450px;
    border-radius: 15px;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  .stars {
    display: flex;
    justify-content: center;
    font-size: 2rem;
    color: #ccc;
    cursor: pointer;
  }

  .star.active {
    color: gold;
    transform: scale(1.2);
    transition: transform 0.2s ease;
  }

  /* === Product Cell Layout === */
  .product-cell {
    vertical-align: middle;
  }

  .product-info {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .product-name {
    font-weight: 500;
    color: var(--text-dark);
    word-break: break-word;
  }

  /* === Feedback Button === */
  .btn-feedback {
    background-color: transparent;
    border: 1.5px solid var(--brown-dark);
    color: var(--brown-dark);
    font-weight: 600;
    border-radius: 25px;
    padding: 5px 14px;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .btn-feedback:hover {
    background-color: var(--brown-dark);
    color: #fff !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(112, 168, 77, 0.25);
  }

  /* === Responsive Tweaks === */
  /* === Responsive Fix: Center Review Button on Mobile === */
  @media (max-width: 768px) {
    .product-cell {
      display: flex;
      flex-direction: column;
      align-items: center; /* centers horizontally */
      justify-content: center;
      padding: 8px 0;
      text-align: center;
    }

    .product-info {
      width: 100%;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 6px;
    }

    .product-name {
      width: 100%;
      text-align: center;
      font-size: 1rem;
    }

    .btn-feedback {
      width: 80%; /* nice touch target, not edge-to-edge */
      justify-content: center;
      margin-top: 6px;
      align-self: center;
      text-align: center;
    }
  }

/* Optional for very small screens */
@media (max-width: 480px) {
  .btn-feedback {
    width: 90%;
    font-size: 0.85rem;
  }
}

      `}</style>

      {user && (
        <NotificationPanel
          isOpen={notifPanelOpen}
          onClose={() => setNotifPanelOpen(false)}
          user={user}
          notifications={notifications}
          setNotifications={setNotifications}
          unreadCount={unreadCount}
          setUnreadCount={setUnreadCount}
          openFeedbackModal={openFeedbackModal}
        />
      )}

      {showModal && (
        <div className="feedback-modal">
          <div className="feedback-content p-4 rounded shadow">
            <h5 className="text-success fw-bold mb-3">
              Feedback for {feedbackProduct?.name}
            </h5>

            {/* ⭐ Star Rating */}
            <div className="stars mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= (hover || rating) ? "active" : ""}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(rating)}
                >
                  ★
                </span>
              ))}
            </div>

            {/* 💬 Comment */}
            <textarea
              className="form-control mb-3"
              rows="3"
              placeholder="Write your feedback (max 1000 characters)"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 1000))}
            />

            <div className="d-flex justify-content-center gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-success" onClick={submitFeedback}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
