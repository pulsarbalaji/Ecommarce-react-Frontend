import React from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components";

const PageNotFound = () => {
  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <div className="container">
          <div className="row">
            <div className="col-md-12 py-5 bg-light rounded-theme text-center shadow-theme">
              <h4 className="p-3 display-5 text-theme-dark">404: Page Not Found</h4>
              <Link to="/" className="btn btn-outline-themed mx-4">
                <i className="fa fa-arrow-left"></i> Go Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        :root {
          --brown-dark: #7a563a;
          --brown-light: #f1e6d4;
          --cream-bg: #fffaf4;
          --text-dark: #5b3b25;
        }

        .bg-light {
          background-color: var(--cream-bg) !important;
        }

        .rounded-theme {
          border-radius: 12px !important;
        }

        .shadow-theme {
          box-shadow: 0 5px 14px rgba(122, 86, 58, 0.15) !important;
        }

        .text-theme-dark {
          color: var(--text-dark);
        }

        .btn-outline-themed {
          color: var(--brown-dark);
          border-color: var(--brown-dark);
          border-width: 2px;
          border-radius: 25px;
          font-weight: 600;
          padding: 8px 24px;
          transition: all 0.3s ease;
          background-color: transparent;
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }

        .btn-outline-themed:hover,
        .btn-outline-themed:focus {
          background-color: var(--brown-dark);
          color: #fff;
          border-color: var(--brown-dark);
          outline: none;
          text-decoration: none;
        }

        .btn-outline-themed i {
          margin-right: 8px;
        }
      `}</style>
    </>
  );
};

export default PageNotFound;
