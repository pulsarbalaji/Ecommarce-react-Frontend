import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import '../styles/index.css';

const CategorySidebar = ({ categories, selectedCat, handleCategory }) => {
  return (
    <>
      {/* --- Inline Styles --- */}
      <style>
        {`
        /* Sidebar Wrapper */
        .category-sidebar {
          width: 220px;
          position: sticky;
          top: 80px;
          align-self: flex-start;
          background: #fff9f3; /* updated background to match Navbar */
          border-right: 1.5px solid #e6d2b5; /* updated border */
          height: calc(100vh - 80px);
          overflow: hidden;
          z-index: 10;
        }

        /* Scrollable area inside */
        .category-sidebar .sidebar-scroll-area {
          flex-grow: 1;
          overflow-y: auto;
          padding: 20px 0;
          scrollbar-width: thin;
          scrollbar-color: #d8c6b2 transparent;
        }

        /* Webkit scrollbars */
        .category-sidebar .sidebar-scroll-area::-webkit-scrollbar {
          width: 6px;
        }
        .category-sidebar .sidebar-scroll-area::-webkit-scrollbar-thumb {
          background-color: #d8c6b2;
          border-radius: 10px;
        }
        .category-sidebar .sidebar-scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }

        /* Hover effects for category items */
        .category-sidebar .list-group-item:hover {
          background-color: #f7f0e6 !important; /* light hover similar to navbar */
          color: #70a84d !important; /* primary green */
        }

        /* Active item style */
        .category-sidebar .list-group-item.active {
          background-color: #70a84d !important; /* primary green */
          color: #fff !important;
          border: none !important;
        }

        /* Hide sidebar on mobile */
        @media (max-width: 992px) {
          .category-sidebar {
            display: none;
          }
        }
      `}
      </style>

      {/* --- Sidebar Content --- */}
      <div className="category-sidebar d-none d-lg-flex flex-column">
        <div className="sidebar-scroll-area">
          <h5
            className="text-center fw-bold mb-3"
            style={{ color: "#198754", flexShrink: 0 }} /* updated header color */
          >
            Categories
          </h5>

          <ul
            className="list-group list-group-flush"
            style={{
              background: "transparent",
              cursor: "pointer",
            }}
          >
            {/* All Products */}
            <li
              className={`list-group-item ${
                selectedCat === null ? "active" : ""
              }`}
              onClick={() => handleCategory(null)}
              style={{
                background: selectedCat === null ? "#70a84d" : "transparent",
                color: selectedCat === null ? "#fff" : "#70a84d",
                border: "none",
                fontWeight: 600,
              }}
            >
              All Products
            </li>

            {/* Category List */}
            {categories.map((cat) => (
              <li
                key={cat.id}
                className={`list-group-item ${
                  selectedCat === cat.id ? "active" : ""
                }`}
                onClick={() => handleCategory(cat.id)}
                style={{
                  background:
                    selectedCat === cat.id ? "#70a84d" : "transparent",
                  color: selectedCat === cat.id ? "#fff" : "#70a84d",
                  border: "none",
                  fontWeight: 600,
                }}
              >
                {cat.category_name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default CategorySidebar;
