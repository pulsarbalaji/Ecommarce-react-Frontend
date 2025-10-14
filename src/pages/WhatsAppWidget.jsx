import React, { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_NUMBER = "919842782259"; // Your WhatsApp number (countrycode + number)

const defaultMsg = "Hi, I'm at your online store and need some help";

const WhatsAppWidget = () => {
  const [open, setOpen] = useState(false);
  const [userNumber, setUserNumber] = useState("");
  const [msg, setMsg] = useState(defaultMsg);

  // Open WhatsApp with prefilled message for that number
  const handleChatStart = () => {
    // Clean number (remove spaces, etc.)
    const trimmedNumber = userNumber.replace(/\s+/g, "");
    const queryMsg = encodeURIComponent(msg + (trimmedNumber ? ` (${trimmedNumber})` : ""));
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${queryMsg}`,
      "_blank"
    );
    setOpen(false);
    // Optionally, clear the state here
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <button
        className="whatsapp-fab"
        aria-label="Chat on WhatsApp"
        onClick={() => setOpen(true)}
      >
        <FaWhatsapp size={36} />
      </button>

      {/* Modal */}
      {open && (
        <>
          <div
            className="wa-modal-backdrop"
            onClick={() => setOpen(false)}
          />
          <div className="wa-modal">
            <div className="wa-modal-header">
              <FaWhatsapp size={34} color="#25d366" />
              <span>Chat with us on WhatsApp</span>
              <button className="wa-modal-close" onClick={() => setOpen(false)}>
                &times;
              </button>
            </div>
            <div className="wa-modal-body">
              <label htmlFor="wa-number" className="wa-label">
                Enter your number
              </label>
              <input
                id="wa-number"
                type="text"
                className="wa-input"
                placeholder="Eg. 9876543210"
                value={userNumber}
                onChange={e => setUserNumber(e.target.value)}
                maxLength={15}
                autoFocus
              />
              <label htmlFor="wa-msg" className="wa-label">
                Message
              </label>
              <textarea
                id="wa-msg"
                className="wa-input"
                placeholder="Type your message"
                rows={3}
                value={msg}
                onChange={e => setMsg(e.target.value)}
              />
              <button className="wa-chat-btn" onClick={handleChatStart}>
                Start a chat
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        .whatsapp-fab {
          position: fixed;
          right: 33px;
          bottom: 38px;
          z-index: 2061;
          background: #25d366;
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.13);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: box-shadow 0.21s, background 0.23s;
        }
        .whatsapp-fab:hover,
        .whatsapp-fab:focus {
          background: #128c7e;
          box-shadow: 0 8px 24px rgba(39, 187, 94, 0.22);
        }
        .wa-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(80,80,80,0.37);
          z-index: 2062;
        }
        .wa-modal {
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
        .wa-modal-header {
          padding: 22px 26px 0 26px;
          display: flex;
          align-items: center;
          font-weight: 700;
          font-size: 1.13rem;
          color: #1e1e1e;
        }
        .wa-modal-header span {
          margin-left: 8px;
          flex: 1;
        }
        .wa-modal-close {
          background: none;
          border: none;
          font-size: 2rem;
          font-weight: 600;
          color: #7a563a;
          cursor: pointer;
          margin-left: 8px;
          margin-top: -8px;
        }
        .wa-modal-body {
          padding: 12px 26px 0 26px;
          display: flex;
          flex-direction: column;
          gap: 11px;
        }
        .wa-label {
          font-size: 1rem;
          color: #7a563a;
          margin: 2px 0 1px 2px;
          font-weight: 600;
        }
        .wa-input {
          border: 1.5px solid #e6d2b5;
          border-radius: 12px;
          padding: 9px 12px;
          font-size: 1.08rem;
          color: #7a563a;
          background: #fffaf4;
          font-weight: 600;
          outline: none;
          resize: none;
          margin-bottom: 2px;
        }
        .wa-input:focus {
          border-color: #25d366;
        }
        .wa-chat-btn {
          margin-top: 10px;
          padding: 11px 0;
          background: #25d366;
          color: #fff;
          border: none;
          font-weight: 700;
          border-radius: 16px;
          font-size: 1.08rem;
          cursor: pointer;
          transition: background 0.23s;
        }
        .wa-chat-btn:hover,
        .wa-chat-btn:focus {
          background: #128c7e;
        }
        @media (max-width: 600px) {
          .wa-modal { max-width: 95vw; }
        }
      `}</style>
    </>
  );
};

export default WhatsAppWidget;
