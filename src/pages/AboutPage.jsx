import React, { useEffect, useState } from "react";
import { Footer, Navbar } from "../components";
import api from "../utils/base_url";

const AboutPage = () => {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch categories
  const fetchCategories = async (pageNum = 1) => {
    try {
      const res = await api.get(`/categories/?page=${pageNum}`);
      if (res.data && res.data.data) {
        if (pageNum === 1) {
          setCategories(res.data.data);
        } else {
          setCategories((prev) => [...prev, ...res.data.data]);
        }

        // If fewer than 10 returned → no more pages
        if (res.data.data.length < 10) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories(1); // load first page
  }, []);

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1 className="text-center" style={{ color: "#7a563a", fontWeight: 700 }}>
          About Us
        </h1>
        <hr />
        <p className="lead text-center" style={{ color: "#68492f", maxWidth: "700px", margin: "0 auto" }}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
          facere doloremque veritatis odit similique sequi. Odit amet fuga nam
          quam quasi facilis sed doloremque saepe sint perspiciatis explicabo
          totam vero quas provident ipsam, veritatis nostrum velit quos
          recusandae est mollitia esse fugit dolore laudantium.
        </p>

        <h2 className="text-center py-4" style={{ color: "#7a563a", fontWeight: 600 }}>
          Our Categories
        </h2>

        {/* Horizontally scrollable grid for categories */}
        <div className="categories-scroll-wrapper">
          <div className="grid-container">
            {categories.map((cat) => (
              <div key={cat.id} className="product-card">
                <div className="img-wrapper">
                  <img
                    src={
                      cat.category_image
                        ? `${process.env.REACT_APP_API_URL}${cat.category_image}`
                        : "https://via.placeholder.com/300x200?text=No+Image"
                    }
                    alt={cat.category_name}
                  />
                </div>
                <div className="product-content">
                  <h5 className="product-title">{cat.category_name}</h5>
                  <p className="product-desc">{cat.description || "No description"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Show More button */}
        {hasMore && categories.length > 0 && (
          <div className="text-center mt-3">
            <button
              className="btn-nav"
              onClick={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchCategories(nextPage);
              }}
            >
              Show More
            </button>
          </div>
        )}
      </div>
      <Footer />

      {/* Theme and layout styles */}
      <style>{`
        h1, h2 {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .categories-scroll-wrapper {
          overflow-x: auto;
          padding-bottom: 12px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #7a563a #f1e6d4;
        }
        /* Webkit scrollbar styling */
        .categories-scroll-wrapper::-webkit-scrollbar {
          height: 8px;
        }
        .categories-scroll-wrapper::-webkit-scrollbar-track {
          background: #f1e6d4;
          border-radius: 10px;
        }
        .categories-scroll-wrapper::-webkit-scrollbar-thumb {
          background: #7a563a;
          border-radius: 10px;
        }

        .grid-container {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 280px; /* Reduced width for medium size */
  gap: 18px;
  padding-left: 10px;
}

/* Responsive grid fallback */
@media (max-width: 1024px) {
  .grid-container {
    grid-auto-columns: 260px;
    gap: 16px;
    padding-left: 8px;
  }
}
@media (max-width: 768px) {
  .grid-container {
    grid-auto-columns: 240px;
    gap: 14px;
    padding-left: 6px;
  }
}
@media (max-width: 576px) {
  .grid-container {
    grid-auto-columns: 220px;
    gap: 12px;
    padding-left: 4px;
  }
}


        /* Hide vertical scrollbar if appears */
        .grid-container::-webkit-scrollbar {
          display: none;
        }

        /* Card styling matches Products theme */
        .product-card {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #f1e6d4;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 340px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          flex-shrink: 0; /* Prevent shrinking */
        }
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 5px 14px rgba(122, 86, 58, 0.15);
        }
        .img-wrapper {
          background: #fffaf4;
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
        }
        .img-wrapper img {
          width: 80%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.3s ease;
        }
        .product-card:hover img {
          transform: scale(1.05);
        }
        .product-content {
          text-align: center;
          padding: 12px 10px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .product-title {
          font-weight: 600;
          font-size: 1rem;
          color: #5b3b25;
          margin-bottom: 6px;
        }
        .product-desc {
          color: #777;
          font-size: 0.85rem;
          flex-grow: 1;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          min-height: unset;
          max-height: unset;
        }

        .btn-nav {
          border: none;
          background: #7a563a;
          color: #fff;
          padding: 8px 20px;
          border-radius: 25px;
          margin: 0 4px;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .btn-nav:hover {
          background: #68492f;
        }
        .btn-nav:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Responsive grid fallback */
        @media (max-width: 1024px) {
          .categories-scroll-wrapper {
            overflow-x: auto;
          }
          .grid-container {
            grid-auto-columns: 300px;
            gap: 16px;
            padding-left: 8px;
          }
        }
        @media (max-width: 768px) {
          .grid-container {
            grid-auto-columns: 280px;
            gap: 14px;
            padding-left: 6px;
          }
        }
        @media (max-width: 576px) {
          .grid-container {
            grid-auto-columns: 260px;
            gap: 12px;
            padding-left: 4px;
          }
        }
      `}</style>
    </>
  );
};

export default AboutPage;
