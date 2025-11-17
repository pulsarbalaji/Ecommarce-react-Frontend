import React, { useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/index.css";

const CategorySidebar = ({ categories, selectedCat, handleCategory }) => {
  const listRef = useRef(null);

  // ✅ Auto-scroll active category into center view
  useEffect(() => {
    if (!listRef.current || selectedCat === null) return;
    const activeItem = listRef.current.querySelector(".list-group-item.active");
    if (activeItem) {
      activeItem.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedCat]);

  return (
    <>
      <style>
        {`
        /* === Modern Sidebar === */
        .category-sidebar {
          width: 240px;
          position: sticky;
          top: 80px;
          align-self: flex-start;
          background: linear-gradient(180deg, #fffaf4 0%, #fff9f3 100%);
          border-right: 1.5px solid #e6d2b5;
          height: calc(100vh - 80px);
          border-radius: 0;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          transition: all 0.3s ease;
          z-index: 10;
        }

        /* Scroll area inside */
        .category-sidebar .sidebar-scroll-area {
          flex-grow: 1;
          overflow-y: auto;
          padding: 20px 0 40px 0;
          scrollbar-width: thin;
          scrollbar-color: #d8c6b2 transparent;
          scroll-behavior: smooth;
        }

        /* Scrollbar styling */
        .category-sidebar .sidebar-scroll-area::-webkit-scrollbar {
          width: 6px;
        }
        .category-sidebar .sidebar-scroll-area::-webkit-scrollbar-thumb {
          background-color: #d8c6b2;
          border-radius: 10px;
        }

        /* Header */
        .category-header {
          color: #000000ff;
          font-weight: 700;
          font-size: 1.1rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          text-align: center;
          padding: 14px 0;
          background: #fdf7f2;
          border-bottom: 1.5px solid #e6d2b5;
          position: sticky;
          top: 0;
          z-index: 5;
        }

        /* Category list */
        .category-list {
          list-style: none;
          margin: 0;
          padding: 10px 0;
        }

        .category-item {
          padding: 12px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          color: #000000ff;
          cursor: pointer;
          transition: all 0.25s ease-in-out;
          position: relative;
          border-left: 4px solid transparent;
        }

        /* Add smooth underline highlight */
        .category-item::before {
          content: "";
          position: absolute;
          bottom: 0;
          left: 20px;
          width: 0;
          height: 2px;
          background-color: #198754;
          transition: width 0.3s ease-in-out;
        }

        /* Hover effect */
        .category-item:hover {
          background-color: #f5f0e9;
          color: #198754;
          border-left: 4px solid #198754;
        }
        .category-item:hover::before {
          width: calc(100% - 40px);
        }

        /* Active style */
        .category-item.active {
          background-color: #198754;
          color: #fff !important;
          border-left: 4px solid #198754;
        }
        .category-item.active:hover {
          background-color: #198754;
        }

        /* Icon styling */
        .category-item svg {
          width: 18px;
          height: 18px;
          color: inherit;
          flex-shrink: 0;
        }

        /* Divider between categories */
        .category-item + .category-item {
          border-top: 1px dashed rgba(112, 168, 77, 0.15);
        }

        /* Hide sidebar on small screens */
        @media (max-width: 992px) {
          .category-sidebar {
            display: none;
          }
        }
      `}
      </style>

      <div className="category-sidebar d-none d-lg-flex flex-column">
        <div className="category-header">Categories</div>
        <div className="sidebar-scroll-area" ref={listRef}>
          <ul className="category-list">
            {/* All Products */}
          

            {/* Categories */}
            {categories.map((cat) => (
              <li
                key={cat.id}
                className={`category-item ${
                  selectedCat === cat.id ? "active" : ""
                }`}
                onClick={() => handleCategory(cat.id)}
              >
              
                <span>{cat.category_name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default CategorySidebar;
