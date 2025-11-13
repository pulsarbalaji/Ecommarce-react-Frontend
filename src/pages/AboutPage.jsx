import React, { useEffect, useState } from "react";
import { Footer, Navbar } from "../components";
import api from "../utils/base_url";
import '../styles/index.css';
import { useNavigate } from "react-router-dom";

const AboutPage = () => {
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();
  const handleCategoryClick = (categoryId) => {
    // Navigate to products page with category ID as state
    navigate("/product", { state: { categoryId } });
  };
  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get(`/categories/`);
        if (res.data && res.data.data) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Duplicate categories for infinite loop effect
  const repeatedCategories = [...categories, ...categories, ...categories];

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1
          className="text-center"
          style={{ color: "#198754", fontWeight: 700 }}
        >
          About Us
        </h1>
        <hr />
        <p
          className="lead text-center"
          style={{ color: "#000000ff", maxWidth: "700px", margin: "0 auto" }}
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
          facere doloremque veritatis odit similique sequi. Odit amet fuga nam
          quam quasi facilis sed doloremque saepe sint perspiciatis explicabo
          totam vero quas provident ipsam, veritatis nostrum velit quos
          recusandae est mollitia esse fugit dolore laudantium.
        </p>

        <h2
          className="text-center py-4"
          style={{ color: "#198754", fontWeight: 600 }}
        >
          Our Categories
        </h2>

        {/* Continuous marquee-like scroll */}
        <div className="marquee-wrapper">
          <div className="marquee">
            {repeatedCategories.map((cat, index) => (
              <div
                key={index}
                className="product-card"
                onClick={() => handleCategoryClick(cat.id)}
                style={{ cursor: "pointer" }}
              >

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
                  <p className="product-desc">
                    {cat.description || "No description"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        h1, h2 {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        /* Marquee-style wrapper */
        .marquee-wrapper {
          position: relative;
          overflow: hidden;
          width: 100%;
          background: transparent;
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }

        /* The moving container */
        .marquee {
          display: flex;
          gap: 18px;
          animation: scrollLeft 10s linear infinite;
          will-change: transform;
        }

        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .product-card {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #cfead9;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 240px;
          height: 300px;
          flex-shrink: 0;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .product-card:hover {
          transform: scale(1.03);
          box-shadow: 0 5px 14px rgba(25, 135, 84, 0.15);
        }

        .img-wrapper {
          background: #e9f7ef;
          height: 140px;
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
          transform: scale(1.08);
        }

        .product-content {
          text-align: center;
          padding: 12px 10px;
        }

        .product-title {
          font-weight: 600;
          font-size: 1rem;
          color: #198754;
          margin-bottom: 6px;
        }

        .product-desc {
          color: #000000ff;
          font-size: 0.85rem;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        /* Pause animation on hover */
        .marquee-wrapper:hover .marquee {
          animation-play-state: paused;
        }

        @media (max-width: 768px) {
          .product-card {
            width: 200px;
            height: 260px;
          }
          .img-wrapper {
            height: 120px;
          }
        }
      `}</style>
    </>
  );
};

export default AboutPage;
