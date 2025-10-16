import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

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
          background: #fffaf4;
          border-right: 1.5px solid #f1e6d4;
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
          background-color: #f7ede2 !important;
          color: #7a563a !important;
        }

        /* Active item style */
        .category-sidebar .list-group-item.active {
          background-color: #7a563a !important;
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
            style={{ color: "#7a563a", flexShrink: 0 }}
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
                background: selectedCat === null ? "#7a563a" : "transparent",
                color: selectedCat === null ? "#fff" : "#7a563a",
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
                    selectedCat === cat.id ? "#7a563a" : "transparent",
                  color: selectedCat === cat.id ? "#fff" : "#7a563a",
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
