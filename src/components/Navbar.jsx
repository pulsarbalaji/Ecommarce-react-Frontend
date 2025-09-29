import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileUpdateForm from "../pages/ProfileUpdateForm";

const Navbar = () => {

  const state = useSelector((state) => state.handleCart);
  const token = sessionStorage.getItem("access");
  const user = sessionStorage.getItem("user");
  
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef();

  
  const handleProfileClick = () => {
    // just open modal using bootstrap
    const modal = new window.bootstrap.Modal(
      document.getElementById("profileModal")
    );
    modal.show();
    
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
          {" "}
          React Ecommerce
        </NavLink>
        <button
          className="navbar-toggler mx-2"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav m-auto my-2 text-center">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Home{" "}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/product">
                Products
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/contact">
                Contact
              </NavLink>
            </li>
          </ul>
          <div className="buttons text-center d-flex align-items-center">
            {token && user ? (
              // Logged in: Show profile avatar + cart
              <div className="d-flex align-items-center">
                <NavLink to="/cart" className="btn btn-outline-dark m-2">
                  <i className="fa fa-cart-shopping mr-1"></i> Cart (
                  {state.length})
                </NavLink>
                <div className="dropdown me-3">
                  <button
                    className="btn dropdown-toggle d-flex align-items-center"
                    type="button"
                    id="profileDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ border: "none", background: "transparent" }}
                    onClick={() => setOpenMenu(!openMenu)}
                  >
                    <img
                      src="data:image/jpeg;base64,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"
                      alt="profile"
                      className="rounded-circle me-2"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                      }}
                    />
                    <span className="fw-bold">Bala</span>
                  </button>
                  {openMenu && (
                    <div
                      className="position-absolute bg-white border shadow-sm rounded d-flex flex-column"
                      style={{
                        top: "50px",
                        right: 0,
                        minWidth: "150px",
                        zIndex: 1000,
                        padding: "10px",
                        gap: "8px", // space between buttons
                      }}
                    >
                      <button
                        className="btn btn-light w-100"
                        onClick={handleProfileClick}
                      >
                        User Profile
                      </button>
                      <button
                        className="btn btn-danger w-100"
                        //    onClick={logout}
                      >
                        Logout
                      </button>
                      
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Not logged in: Show Login & Register + cart
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
    <ProfileUpdateForm />
    </>
  );
};

export default Navbar;
