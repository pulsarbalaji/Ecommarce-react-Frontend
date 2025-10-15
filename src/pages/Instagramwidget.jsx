import React, { useState } from "react";
import { FaInstagram } from "react-icons/fa";

// Instagram username (change to yours)
const INSTA_USERNAME = "kaavya_balamurugan";
const defaultMsg = "Hi, I found you via your online store!";

const InstagramWidget = ({ inNavbar }) => {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [msg, setMsg] = useState(defaultMsg);

  // Detect mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 600;

  // Open IG profile in a new tab
  const handleChatStart = () => {
    window.open(
      `https://instagram.com/${INSTA_USERNAME}`,
      "_blank"
    );
    setOpen(false);
  };

  return (
    <>
      {/* Floating Instagram FAB (hidden if inNavbar) */}
      {!inNavbar && (
        <button
          className="instagram-fab"
          aria-label="Open Instagram"
          onClick={() => setOpen(true)}
          style={{
            width: isMobile ? 44 : 50,
            height: isMobile ? 44 : 50,
            right: isMobile ? 14 : 33,
            bottom: isMobile ? 70 : 110, // above WhatsApp FAB
          }}
        >
          <FaInstagram size={isMobile ? 23 : 29} />
        </button>
      )}

      {/* Instagram in Navbar (mobile) */}
      {inNavbar && (
        <button
          className="instagram-navbar"
          aria-label="Open Instagram"
          onClick={() => setOpen(true)}
          style={{ background: "none", border: "none", padding: "0 6px", cursor: "pointer" }}
        >
          <FaInstagram size={22} style={{ color: "#e1306c" }} />
        </button>
      )}

      {/* Modal */}
      {open && (
        <>
          <div
            className="insta-modal-backdrop"
            onClick={() => setOpen(false)}
          />
          <div className="insta-modal">
            <div className="insta-modal-header">
              <FaInstagram size={28} color="#e1306c" />
              <span>Message us on Instagram</span>
              <button className="insta-modal-close" onClick={() => setOpen(false)}>
                &times;
              </button>
            </div>
            <div className="insta-modal-body">
              <label htmlFor="ig-user" className="insta-label">
                (Your Instagram username, optional)
              </label>
              <input
                id="ig-user"
                type="text"
                className="insta-input"
                placeholder="Eg. johndoe123"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                maxLength={30}
              />
              <label htmlFor="ig-msg" className="insta-label">
                Message
              </label>
              <textarea
                id="ig-msg"
                className="insta-input"
                placeholder="Type your message"
                rows={3}
                value={msg}
                onChange={e => setMsg(e.target.value)}
              />
              <button className="insta-chat-btn" onClick={handleChatStart}>
                Message us
              </button>
              <div className="insta-note">
                (You will be redirected to Instagram)
              </div>
            </div>
          </div>
        </>
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
          width: 60px;
          height: 60px;
          box-shadow: 0 4px 16px rgba(250, 68, 142, 0.23);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: box-shadow 0.21s, background 0.21s;
        }
        .instagram-fab:hover,
        .instagram-fab:focus {
          opacity: 0.93;
          box-shadow: 0 8px 32px rgba(225, 48, 108, 0.27);
        }
        .insta-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(80,80,80,0.25);
          z-index: 2062;
        }
        .insta-modal {
          position: fixed;
          left: 50%;
          top: 50%;
          z-index: 2063;
          background: #fff;
          border-radius: 22px;
          max-width: 350px;
          width: 94%;
          box-shadow: 0 6px 40px rgba(122,86,58,0.18);
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          padding-bottom: 14px;
        }
        .insta-modal-header {
          padding: 22px 26px 0 26px;
          display: flex;
          align-items: center;
          font-weight: 700;
          font-size: 1.13rem;
          color: #1e1e1e;
        }
        .insta-modal-header span { margin-left: 8px; flex: 1; }
        .insta-modal-close {
          background: none;
          border: none;
          font-size: 2rem;
          font-weight: 600;
          color: #e1306c;
          cursor: pointer;
          margin-left: 8px;
          margin-top: -8px;
        }
        .insta-modal-body {
          padding: 12px 26px 0 26px;
          display: flex;
          flex-direction: column;
          gap: 11px;
        }
        .insta-label {
          font-size: 1rem;
          color: #e1306c;
          margin: 2px 0 1px 2px;
          font-weight: 600;
        }
        .insta-input {
          border: 1.5px solid #f6b2c0;
          border-radius: 12px;
          padding: 9px 12px;
          font-size: 1.08rem;
          color: #e1306c;
          background: #fff8fa;
          font-weight: 600;
          outline: none;
          resize: none;
          margin-bottom: 2px;
        }
        .insta-input:focus { border-color: #e1306c; }
        .insta-chat-btn {
          margin-top: 10px;
          padding: 11px 0;
          background: linear-gradient(45deg, #fd1d1d, #fcb045, #e1306c 99%);
          color: #fff;
          border: none;
          font-weight: 700;
          border-radius: 16px;
          font-size: 1.08rem;
          cursor: pointer;
        }
        .insta-chat-btn:hover { opacity: 0.9; }
        .insta-note {
          margin-top: 11px;
          color: #999;
          font-size: 0.85rem;
          text-align: center;
        }
        @media (max-width: 600px) {
          .instagram-fab {
            width: 44px; height: 44px; right: 14px; bottom: 70px;
          }
          .insta-modal { max-width: 96vw; }
        }
      `}</style>
    </>
  );
};

export default InstagramWidget;
