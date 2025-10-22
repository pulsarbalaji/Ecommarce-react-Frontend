import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import toast from "react-hot-toast";
import api from "../utils/base_url";
import CategorySidebar from "./CategorySidebar";

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
      const url = categoryId
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
      {/* Mobile category buttons */}
      <div className="d-flex flex-wrap justify-content-center py-4 gap-2 d-lg-none">
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
          <button className="cat-btn more-btn" onClick={() => setShowModal(true)}>
            More +
          </button>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid-container">
        {products.map((product, idx) => {
          const hasOffer =
            product.offer_percentage &&
            Number(product.offer_percentage) > 0 &&
            product.offer_price;

          const altCardClass = idx % 2 === 0 ? "card-even" : "card-odd";
          const outOfStock = !product.is_available || product.stock_quantity === 0;
          const stockLow = product.stock_quantity <= 10 && product.stock_quantity > 0;

          return (
            <div
              key={product.id}
              className={`product-card ${altCardClass}${outOfStock ? " out-of-stock" : ""}`}
              style={outOfStock ? { opacity: 0.5, pointerEvents: "none" } : {}}
            >
              {hasOffer && (
                <span className="offer-badge">
                  {Math.round(product.offer_percentage)}% OFF
                </span>
              )}

              {outOfStock && (
                <span className="stock-badge out-stock">Out of Stock</span>
              )}
              {!outOfStock && stockLow && (
                <span className="stock-badge low-stock">Hurry! Only {product.stock_quantity} left</span>
              )}

              <div className="img-wrapper">
                <img
                  src={`${process.env.REACT_APP_API_URL}${product.product_image}`}
                  alt={product.product_name}
                />
              </div>
              <div className="product-content">
                <h5 className="product-title">
                  {product.product_name.length > 15
                    ? product.product_name.substring(0, 15) + "..."
                    : product.product_name}
                </h5>
                <p className="product-desc">
                  {product.product_description.length > 70
                    ? product.product_description.substring(0, 70) + "..."
                    : product.product_description}
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
              <div className="product-btns">
                <Link
                  to={outOfStock ? "#" : `/product/${product.id}`}
                  className="btn-buy"
                  tabIndex={outOfStock ? -1 : 0}
                  style={outOfStock ? { pointerEvents: "none", opacity: 0.7 } : {}}
                >
                  Buy Now
                </Link>
                <button
                  className="btn-cart"
                  onClick={() => addProduct(product)}
                  disabled={outOfStock}
                  style={outOfStock ? { pointerEvents: "none", opacity: 0.7 } : {}}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <button
          className="btn-nav"
          disabled={page === 1}
          onClick={() => fetchProducts(page - 1, selectedCat ? selectedCat : null)}
        >
          ‹ Prev
        </button>
        <button
          className="btn-nav"
          disabled={page === totalPages}
          onClick={() => fetchProducts(page + 1, selectedCat ? selectedCat : null)}
        >
          Next ›
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div
            className="modal-backdrop-themed"
            onClick={() => setShowModal(false)}
          ></div>

          <div className="modal-content-themed" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>
              ×
            </button>

            <h5 className="modal-title-themed">All Categories</h5>

            <div className="modal-body-themed">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`cat-btn w-100 mb-2 ${
                    selectedCat === cat.id ? "active" : ""
                  }`}
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
        </>
      )}
    </>
  );

  return (
    <div className="d-flex align-items-start">
      {/* Sidebar (desktop only) */}
      <div className="d-none d-lg-block">
        <CategorySidebar
          categories={categories}
          selectedCat={selectedCat}
          handleCategory={(id) => {
            setSelectedCat(id);
            fetchProducts(1, id);
          }}
        />
      </div>

      {/* Main content */}
      <div className="flex-grow-1 container my-4 py-3">
        <h2
          className="display-6 fw-bold text-center text-uppercase mb-4"
          style={{ color: "#198754" }}
        >
          Our Products
        </h2>
        {loading ? <Loading /> : <ShowProducts />}
      </div>

      <style>{`
        /* Grid */
        .grid-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
          padding: 0 10px;
        }
        @media (min-width: 768px) { .grid-container { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .grid-container { grid-template-columns: repeat(4, 1fr); } }
        @media (min-width: 1400px) { .grid-container { grid-template-columns: repeat(6, 1fr); } }

        .product-card {
          position: relative;
          background: #fff9f3;
          border-radius: 12px;
          overflow: hidden;
          border: 1.5px solid #e6d2b5;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 340px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .product-card.card-even { background: #fff9f3; }
        .product-card.card-odd { background: #fffaf4; }
        .product-card.out-of-stock { opacity: 0.5; pointer-events: none; }

        .offer-badge {
          position: absolute;
          top: 10px;
          right: 0;
          background: linear-gradient(135deg, #ff4b2b, #ff416c);
          color: #fff;
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 6px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.15);
          z-index: 5;
        }
        .stock-badge {
          position: absolute;
          top: 10px;
          left: 0;
          background: #ffc107;
          color: #7a563a;
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 6px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.13);
          z-index: 6;
        }
        .stock-badge.low-stock {
          background: #ffc107;
          color: #000000ff;
        }
        .stock-badge.out-stock {
          background: #dc3545;
          color: #fff;
        }

        .img-wrapper {
          height: 150px;
          background: #fffaf4;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .img-wrapper img { width: 80%; height: 100%; object-fit: contain; transition: transform 0.3s ease; }
        .product-card:hover img { transform: scale(1.05); }

        .product-content {
          text-align: center;
          padding: 10px 12px;
          flex-grow: 1;
        }
        .product-title { font-weight: 600; font-size: 0.95rem; color: #198754; margin-bottom: 4px; }
        .product-desc { color: #030303ff; font-size: 0.85rem; }

        .product-price-wrap {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 10px;
          margin-top: 6px;
          white-space: nowrap;
        }
        .product-price { color: rgb(112,168,77); font-weight: bold; font-size: 1rem; }
        .product-price-original { color: #dc3545; font-size: 0.93rem; }
        .product-price-offer { color: #198754; font-size: 1.17rem; font-weight: 700; }

        .product-btns {
          display: flex;
          justify-content: center;
          gap: 8px;
          padding-bottom: 10px;
        }

        .btn-buy, .btn-cart {
          border: none;
          border-radius: 25px;
          padding: 5px 12px;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .btn-buy {
          background-color: rgb(112,168,77);
          color: #fff;
          text-decoration: none;
        }
        .btn-buy:disabled, .btn-buy[disabled] {
          background-color: #ddd !important;
          color: #888 !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
        }
        .btn-buy:hover { background-color: #95b25a; text-decoration: none; }
        .btn-cart {
          background-color: #f1e6d4;
          color: #198754;
        }
        .btn-cart:disabled, .btn-cart[disabled] {
          background-color: #ddd !important;
          color: #888 !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
        }
        .btn-cart:hover { background-color: #e6d0b4; }

        .cat-btn {
          border: 1px solid #198754;
          background: #fff;
          color: #198754;
          border-radius: 25px;
          padding: 6px 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .cat-btn.active, .cat-btn:hover { background-color: #198754; color: #fff; }
        .more-btn { background-color: #f1e6d4; color: #198754; }

        .pagination-container {
          display: flex;
          justify-content: center;
          margin-top: 30px;
          gap: 15px;
        }
        .btn-nav {
          background: #198754;
          color: white;
          border: none;
          padding: 6px 14px;
          border-radius: 25px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        .btn-nav:hover { background: #95b25a; }
        .btn-nav:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 767px) {
          .btn-buy, .btn-cart, .cat-btn, .btn-nav { padding: 4px 8px; font-size: 0.75rem; }
          .product-card { height: auto; }
        }

        /* Modal */
        .modal-backdrop-themed {
          position: fixed;
          inset: 0;
          background-color: rgba(255, 249, 243, 0.8);
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
          border: 1.5px solid #e6d2b5;
          border-radius: 14px;
          box-shadow: 0 6px 18px rgba(122,86,58,0.16);
          max-height: 80vh;
          overflow-y: auto;
          padding: 20px;
          z-index: 1060;
          display: flex;
          flex-direction: column;
        }
        .modal-close-btn {
          position: absolute;
          top: 10px;
          right: 12px;
          background: none;
          border: none;
          font-size: 1.5rem;
          font-weight: 600;
          color: #198754;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          z-index: 10;
        }
        .modal-close-btn:hover { color: #198754; transform: scale(1.1); }
        .modal-title-themed { font-size: 1.1rem; font-weight: 600; color: #198754; text-align: center; margin-bottom: 10px; }
        .modal-body-themed { margin-top: 5px; display: flex; flex-direction: column; gap: 8px; }
      `}</style>
    </div>
  );
};

export default Products;
