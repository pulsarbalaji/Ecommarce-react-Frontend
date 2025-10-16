import React, { useState, useEffect } from "react";
import { FaInstagram } from "react-icons/fa";

const INSTA_USERNAME = "kaavya_balamurugan";

const InstagramWidget = ({ inNavbar }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 600);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleOpenInstagram = () => {
    window.open(`https://instagram.com/${INSTA_USERNAME}`, "_blank");
  };

  return (
    <>
      {/* Floating Instagram FAB (Desktop only) */}
      {!inNavbar && !isMobile && (
        <button
          className="instagram-fab"
          aria-label="Open Instagram"
          onClick={handleOpenInstagram}
        >
          <FaInstagram size={28} />
        </button>
      )}

      {/* Instagram icon in Navbar (Mobile only) */}
      {inNavbar && isMobile && (
        <button
          className="instagram-navbar"
          aria-label="Open Instagram"
          onClick={handleOpenInstagram}
        >
          <FaInstagram size={22} style={{ color: "#e1306c" }} />
        </button>
      )}

      <style>{`
        .instagram-fab {
          position: fixed;
          right: 33px;
          bottom: 110px;
          z-index: 2061;
          background: linear-gradient(45deg, #fd1d1d, #fcb045, #e1306c 99%);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          box-shadow: 0 4px 16px rgba(250, 68, 142, 0.23);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: box-shadow 0.21s, opacity 0.21s;
        }

        .instagram-fab:hover,
        .instagram-fab:focus {
          opacity: 0.9;
          box-shadow: 0 8px 24px rgba(225, 48, 108, 0.25);
        }

        .instagram-navbar {
          background: none;
          border: none;
          padding: 0 6px;
          cursor: pointer;
        }

        @media (max-width: 600px) {
          .instagram-fab {
            width: 44px;
            height: 44px;
            right: 14px;
            bottom: 70px;
          }
        }
      `}</style>
    </>
  );
};

export default InstagramWidget;
