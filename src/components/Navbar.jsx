import React, { useEffect, useRef, useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileUpdateForm from "../pages/ProfileUpdateForm";
import api from "../utils/base_url";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const state = useSelector((state) => state.handleCart);
  const navigate = useNavigate();
  const menuRef = useRef();
  const { user, setUser } = useContext(AuthContext);
  const [openMenu, setOpenMenu] = useState(false);

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
  };

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light py-3 sticky-top">
        <div className="container">
          <NavLink className="navbar-brand fw-bold fs-4 px-2" to="/">
            React Ecommerce
          </NavLink>
          <button
            className="navbar-toggler mx-2"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav m-auto my-2 text-center">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">Home</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/product">Products</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/about">About</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/contact">Contact</NavLink>
              </li>
            </ul>

            <div className="buttons text-center d-flex align-items-center">
              {user ? (
                <div className="d-flex align-items-center">
                  <NavLink to="/cart" className="btn btn-outline-dark m-2">
                    <i className="fa fa-cart-shopping mr-1"></i> Cart ({state.length})
                  </NavLink>

                  <div className="dropdown me-3" ref={menuRef}>
                    <button
                      className="btn dropdown-toggle d-flex align-items-center"
                      type="button"
                      style={{ border: "none", background: "transparent" }}
                      onClick={() => setOpenMenu(!openMenu)}
                    >
                      <img
                        src={user.customer_details?.profile_image || "/default-profile.png"}
                        alt={user.customer_details?.full_name || "User"}
                        className="rounded-circle me-2"
                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                      />
                      <span className="fw-bold">
                        {user.customer_details?.full_name || "User"}
                      </span>
                    </button>

                    {openMenu && (
                      <div
                        className="position-absolute bg-white border shadow-sm rounded d-flex flex-column"
                        style={{
                          top: "50px",
                          right: 0,
                          minWidth: "180px",
                          zIndex: 1000,
                          padding: "10px",
                          gap: "8px",
                        }}
                      >
                        <button
                          className="btn btn-light w-100"
                          data-bs-toggle="modal"
                          data-bs-target="#profileModal"
                        >
                          Profile
                        </button>
                        <button
                          className="btn btn-light w-100"
                          onClick={() => navigate("/orderhistory")}
                        >
                          Order History
                        </button>
                        <button
                          className="btn btn-danger w-100"
                          onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <NavLink to="/login" className="btn btn-outline-dark m-2">
                    <i className="fa fa-sign-in-alt mr-1"></i> Login
                  </NavLink>
                  <NavLink to="/register" className="btn btn-outline-dark m-2">
                    <i className="fa fa-user-plus mr-1"></i> Register
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {user && <ProfileUpdateForm />}
    </>
  );
};

export default Navbar;
