import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import toast from "react-hot-toast";
import api from "../utils/base_url";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const addProduct = (product) => {
    if (user) {
      dispatch(addCart(product));
      toast.success("Added to cart");
    } else {
      toast.error("Please login first!");
      navigate("/login");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("categorylist/");
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async (pageNo = 1, categoryId = null) => {
    setLoading(true);
    try {
      let url = categoryId
        ? `productfilter/${categoryId}/?page=${pageNo}`
        : `productlist/?page=${pageNo}`;
      const res = await api.get(url);

      setProducts(res.data.data || []);
      setPage(res.data.current_page || 1);
      setTotalPages(res.data.total_pages || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const Loading = () => (
    <div className="grid-container">
      {[...Array(6)].map((_, idx) => (
        <div key={idx} className="skeleton-card">
          <Skeleton height={280} />
        </div>
      ))}
    </div>
  );

  const ShowProducts = () => (
    <>
      {/* Category Buttons */}
      <div className="d-flex flex-wrap justify-content-center py-4 gap-2">
        <button
          className={`cat-btn ${selectedCat === null ? "active" : ""}`}
          onClick={() => {
            setSelectedCat(null);
            fetchProducts(1, null);
          }}
        >
          All
        </button>

        {categories.slice(0, 4).map((cat) => (
          <button
            key={cat.id}
            className={`cat-btn ${selectedCat === cat.id ? "active" : ""}`}
            onClick={() => {
              setSelectedCat(cat.id);
              fetchProducts(1, cat.id);
            }}
          >
            {cat.category_name}
          </button>
        ))}

        {categories.length > 4 && (
          <button
            className="cat-btn more-btn"
            onClick={() => setShowModal(true)}
          >
            More +
          </button>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid-container">
        {products.map((product, idx) => {
          const hasOffer =
            product.offer_percentage != null &&
            Number(product.offer_percentage) > 0 &&
            product.offer_price != null;

          const altCardClass = idx % 2 === 0 ? "card-even" : "card-odd";

          return (
            <div
              key={product.id}
              className={`product-card shadow-sm ${altCardClass}`}
              style={{ position: "relative" }}
            >
              {hasOffer && (
                <span className="offer-badge">
                  {Math.round(product.offer_percentage)}% OFF
                </span>
              )}
              <div className="img-wrapper">
                <img
                  src={`${process.env.REACT_APP_API_URL}${product.product_image}`}
                  alt={product.product_name}
                />
              </div>
              <div className="product-content">
                <h5 className="product-title">
                  {product.product_name.length > 15 ? product.product_name.substring(0, 15) + "..." : product.product_name}
                </h5>
                <p className="product-desc">
                  {product.product_description.length > 70 ? product.product_description.substring(0, 70) + "..." : product.product_description}
                </p>
                <div className="product-price-wrap">
                  {hasOffer ? (
                    <>
                      <span className="product-price-offer">
                        ₹ {parseFloat(product.offer_price).toLocaleString()}
                      </span>
                      <span className="product-price-original">
                        <s>₹ {parseFloat(product.price).toLocaleString()}</s>
                      </span>
                    </>
                  ) : (
                    <span className="product-price">
                      ₹ {parseFloat(product.price).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="d-flex justify-content-center gap-2 pb-3">
                <Link to={`/product/${product.id}`} className="btn-buy">
                  Buy Now
                </Link>
                <button className="btn-cart" onClick={() => addProduct(product)}>
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-5">
        <button
          className="btn-nav"
          disabled={page === 1}
          onClick={() => fetchProducts(page - 1, selectedCat ? selectedCat : null)}
        >
          ‹ Prev
        </button>
        {/* <span className="page-indicator">
          Page {page} of {totalPages}
        </span> */}
        <button
          className="btn-nav"
          disabled={page === totalPages}
          onClick={() => fetchProducts(page + 1, selectedCat ? selectedCat : null)}
        >
          Next ›
        </button>
      </div>

      {/* Category Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop-themed" onClick={() => setShowModal(false)}></div>
          <div className="modal-content-themed" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-themed">
              <h5 className="modal-title-themed">All Categories</h5>
              <button className="btn-close-themed" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body-themed">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`cat-btn w-100 mb-2 ${selectedCat === cat.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedCat(cat.id);
                    fetchProducts(1, cat.id);
                    setShowModal(false);
                  }}
                >
                  {cat.category_name}
                </button>
              ))}
            </div>
          </div>

          <style>{`
            .modal-backdrop-themed {
              position: fixed;
              inset: 0;
              background-color: rgba(255, 250, 244, 0.8);
              backdrop-filter: blur(4px);
              -webkit-backdrop-filter: blur(4px);
              z-index: 1050;
            }
            .modal-content-themed {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 90%;
              max-width: 400px;
              background-color: #fffaf4;
              border: 1.5px solid #f1e6d4;
              border-radius: 14px;
              box-shadow: 0 6px 18px rgba(122, 86, 58, 0.16);
              max-height: 80vh;
              overflow-y: auto;
              padding: 20px;
              z-index: 1060;
              display: flex;
              flex-direction: column;
            }
            .modal-header-themed {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-bottom: 12px;
              border-bottom: 1px solid #f1e6d4;
              font-weight: 600;
              font-size: 1.25rem;
              color: #7a563a;
            }
            .btn-close-themed {
              background: transparent;
              border: none;
              font-size: 1.75rem;
              line-height: 1;
              cursor: pointer;
              color: #7a563a;
              font-weight: 700;
              padding: 0;
            }
            .modal-body-themed {
              margin-top: 15px;
            }
            .cat-btn {
              border: 1px solid #7a563a;
              background: #fff;
              color: #7a563a;
              border-radius: 25px;
              padding: 10px 14px;
              font-weight: 600;
              transition: all 0.3s ease;
              width: 100%;
              text-align: center;
            }
            .cat-btn.active,
            .cat-btn:hover {
              background-color: #7a563a;
              color: #fff;
            }
          `}</style>
        </>
      )}

      <style>{`
        /* Grid Layout */
        .grid-container {
          display: grid;
          gap: 18px;
          padding: 0 10px;
          grid-template-columns: repeat(2, 1fr);
        }

        @media (min-width: 768px) {
          .grid-container { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1024px) {
          .grid-container { grid-template-columns: repeat(4, 1fr); }
        }
        @media (min-width: 1400px) {
          .grid-container { grid-template-columns: repeat(6, 1fr); }
        }

        /* Product Card */
        .product-card {
          position: relative;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #f1e6d4;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 340px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .product-card.card-even {
          background: #fffaf6;
          border: 1.5px solid #f1e6d4;
        }
        .product-card.card-odd {
          background: #fdf6f0;
          border: 1.5px solid #eadcc8;
        }
        /* Offer Badge — Minimal Corner Tag */
.offer-badge {
  position: absolute;
  top: 10px;
  right: 0px;
  background: linear-gradient(135deg, #ff4b2b, #ff416c);
  color: #fff;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  z-index: 5;
  letter-spacing: 0.3px;
}

        .img-wrapper {
          background: #fffaf4;
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .img-wrapper img {
          width: 80%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.3s ease;
        }
        .product-card:hover img { transform: scale(1.05); }
        .product-content { text-align: center; padding: 10px 12px; flex-grow: 1; }
        .product-title { font-weight: 600; font-size: 0.95rem; color: #5b3b25; margin-bottom: 4px; }
        .product-desc { color: #777; font-size: 0.85rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .product-price-wrap { display: flex; align-items: baseline; gap: 10px; justify-content: center;flex-wrap: nowrap; white-space: nowrap; margin-top: 8px;}
        .product-price { font-size: 1rem; color: #7a563a; font-weight: bold; }
        .product-price-original { font-size: 0.93rem; color: #dc3545; font-weight: 400; margin-left: 4px;}
        .product-price-offer { color: #28a745; font-size: 1.17rem; font-weight: 700; }
        /* Buttons */
        .btn-buy, .btn-cart {
          border: none; border-radius: 25px; padding: 5px 12px;
          font-size: 0.8rem; font-weight: 500; transition: all 0.3s ease;
        }
        .btn-buy { background-color: #7a563a; color: #fff; text-decoration: none; }
        .btn-buy:hover { background-color: #68492f; }
        .btn-cart { background-color: #f1e6d4; color: #7a563a; }
        .btn-cart:hover { background-color: #e8d5b9; }
        /* Category Buttons */
        .cat-btn {
          border: 1px solid #7a563a;
          background: #fff;
          color: #7a563a;
          border-radius: 25px;
          padding: 6px 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .cat-btn.active, .cat-btn:hover {
          background-color: #7a563a;
          color: #fff;
        }
        .more-btn {
          background-color: #f1e6d4;
          color: #7a563a;
        }
        /* Pagination */
        .btn-nav {
          border: none;
          background: #7a563a;
          color: #fff;
          padding: 6px 14px;
          border-radius: 25px;
          margin: 0 4px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .btn-nav:hover { background: #68492f; }
        .page-indicator { padding: 6px 14px; font-weight: 500; color: #7a563a; }
        /* Modal */
        .modal-backdrop-themed {
          position: fixed;
          inset: 0;
          background-color: rgba(255, 250, 244, 0.8);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 1050;
        }
        .modal-content-themed {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 400px;
          background-color: #fffaf4;
          border: 1.5px solid #f1e6d4;
          border-radius: 14px;
          box-shadow: 0 6px 18px rgba(122, 86, 58, 0.16);
          max-height: 80vh;
          overflow-y: auto;
          padding: 20px;
          z-index: 1060;
          display: flex;
          flex-direction: column;
        }
        .modal-header-themed {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1e6d4;
          font-weight: 600;
          font-size: 1.25rem;
          color: #7a563a;
        }
        .btn-close-themed {
          background: transparent;
          border: none;
          font-size: 1.75rem;
          line-height: 1;
          cursor: pointer;
          color: #7a563a;
          font-weight: 700;
          padding: 0;
        }
        .modal-body-themed {
          margin-top: 15px;
        }

        /* Mobile */
        @media (max-width: 767px) {
          .btn-buy, .btn-cart, .cat-btn, .btn-nav {
            padding: 4px 8px;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </>
  );

  return (
    <div className="container my-4 py-3">
      <h2
        className="display-6 fw-bold text-center text-uppercase mb-4"
        style={{ color: "#7a563a" }}
      >
        Our Products
      </h2>
      {loading ? <Loading /> : <ShowProducts />}
    </div>
  );
};

export default Products;
