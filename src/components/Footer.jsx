import React, { useEffect, useState } from "react";
import api from "../utils/base_url";

const Footer = ({ categories = [] }) => {
  const [footerCategories, setFooterCategories] = useState([]);

  useEffect(() => {
    let didCancel = false;

    const fetchCategories = async () => {
      try {
        const res = await api.get("categorylist/");
        if (!didCancel && res.data?.status && Array.isArray(res.data.data)) {
          setFooterCategories(res.data.data);
        }
      } catch (err) {
        if (!didCancel) console.error("Error fetching footer categories:", err);
      }
    };

    // ✅ Only fetch if not already set & no prop provided
    if (categories.length > 0) {
      setFooterCategories(categories);
    } else if (footerCategories.length === 0) {
      fetchCategories();
    }

    return () => {
      didCancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ Empty dependency array ensures this runs only once


  // Split categories into rows of 5
  const chunkedCategories = [];
  for (let i = 0; i < footerCategories.length; i += 5) {
    chunkedCategories.push(footerCategories.slice(i, i + 5));
  }

  // Smooth scroll function (navigates to category section)
  const scrollToCategory = (categoryName) => {
    const section = document.querySelector(`[data-category="${categoryName}"]`);
    if (section) {
      const yOffset = -100; // adjust for navbar height
      const y =
        section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <footer className="footer-wrapper">
      {/* === MAP === */}
      <div className="map-container">
        <iframe
          title="Shop Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3911.517913663213!2d77.75277587458814!3d11.317716388872738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba96f0025b3f179%3A0x24ec0f94a84cd27f!2sVallalar%20Natural%E2%80%99s!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>

      {/* === COLLECTION === */}
      <div className="collection-section container py-5">
        <h3 className="text-center mb-4 fw-bold text-success">Collection</h3>

        {chunkedCategories.length > 0 ? (
          chunkedCategories.map((row, idx) => (
            <div className="row text-center mb-3" key={idx}>
              {row.map((cat) => (
                <div
                  className="col-6 col-md-2 mx-auto category-name"
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.category_name)}
                >
                  {cat.category_name}
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="text-center text-muted">Loading categories...</p>
        )}
      </div>

      {/* === CONTACT INFO === */}
      <div className="footer-info container py-4">
        <div className="row">
          <div className="col-md-4 mb-4 text-center text-md-start">
            <h5 className="fw-bold text-success mb-2">Vallalar Natural’s</h5>
            <p className="small mb-1">
              No. 2, South Street Abatharanapuram Serakuppam Post,
            </p>
            <p className="small mb-1">Vadalur - 607303</p>
            <p className="small mb-1">
              📞 +91 7639157615
            </p>
            <p className="small">
              📧{" vallalarnaturalsvillagekannama@gmail.com"}
            </p>
          </div>

          {/* <div className="col-md-4 mb-4 text-center">
            <h6 className="fw-bold text-success mb-2">Quick Links</h6>
            <ul className="list-unstyled small">
              <li><a href="/terms">Terms & Conditions</a></li>
              <li><a href="/return-policy">Return & Refund Policy</a></li>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/shipping-policy">Shipping & Payment Policy</a></li>
            </ul>
          </div> */}

          <div className="col-md-4 text-center">
            <h6 className="fw-bold text-success mb-3">Follow Us</h6>
            <div className="social-wrapper">
              <a
                href="https://www.instagram.com/village_kannama/"
                target="_blank"
                rel="noopener noreferrer"
                className="insta-icon"
                title="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="url(#instaGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <defs>
                    <linearGradient id="instaGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fdf497" />
                      <stop offset="45%" stopColor="#fd5949" />
                      <stop offset="60%" stopColor="#d6249f" />
                      <stop offset="90%" stopColor="#285AEB" />
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </div>

      <div className="footer-bottom text-center py-3">
        <small>
          © {new Date().getFullYear()} Vallalar Natural’s. Powered by{" "}
          <a href="https://www.instagram.com/scaleupstores" target="_blank" rel="noopener noreferrer">
            Scaleup Stores
          </a>
        </small>
      </div>

      <style>{`
        .footer-wrapper {
          background: #fffaf4;
          border-top: 2px solid #e6d2b5;
          color: #333;
        }

        .collection-section {
          border-top: 1px solid #e6d2b5;
          border-bottom: 1px solid #e6d2b5;
        }

        .category-name {
          font-weight: 600;
          color: #000;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.25s ease;
          padding: 6px 0;
        }

        .category-name:hover {
          color: #198754;
          transform: translateY(-2px);
        }

        .footer-info a {
          color: #198754;
          text-decoration: none;
        }
        .footer-info a:hover {
          text-decoration: underline;
        }

        .footer-bottom {
          background-color: #f8efe3;
          color: #444;
          border-top: 1px solid #e6d2b5;
        }

        .insta-icon i {
          font-size: 1.4rem;
          background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .yt-icon i {
          font-size: 1.4rem;
          color: #ff0000;
        }

        @media (max-width: 768px) {
          .col-md-2 {
            flex: 0 0 45%;
            max-width: 45%;
          }
          .footer-info .row {
            text-align: center;
          }
        }
          .social-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }

        .insta-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: #fff;
          transition: all 0.3s ease;
        }

        .insta-icon:hover {
          transform: scale(1.15);
        }

        .insta-icon svg {
          display: block;
        }

      `}</style>
    </footer>
  );
};

export default Footer;
