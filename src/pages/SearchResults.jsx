import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/base_url";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get("q") || "";
        setSearchTerm(query);
        if (query) fetchSearchResults(query);
    }, [location.search]);

    const fetchSearchResults = async (query) => {
        try {
            setLoading(true);
            const res = await api.get(`products/search/?search=${query}`);
            setResults(res.data.data || []);
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.trim().length > 1) fetchSearchResults(value);
        else setResults([]);
    };

    return (
        <div className="container-fluid py-3 search-page-wrapper">
            {/* ===== Top Header ===== */}
            <div className="search-header d-flex align-items-center gap-3 mb-3 px-3">
                <button className="btn back-btn" onClick={() => navigate(-1)}>
                    <i className="fa fa-arrow-left"></i>
                </button>
                <h5 className="fw-semibold mb-0 flex-grow-1">Search</h5>
            </div>

            {/* ===== 4-Column Web Layout ===== */}
            <div className="row g-3">
                {/* --- Left Section (Stock Alerts) --- */}
                <div className="col-lg-3 d-none d-lg-block">

                </div>

                {/* --- Center Search (Main Content) --- */}
                <div className="col-12 col-lg-6">
                    <div className="search-input-wrapper d-flex align-items-center mb-4">
                        <i className="fa fa-search search-icon"></i>
                        <input
                            type="text"
                            className="form-control search-input"
                            placeholder="Search for products..."
                            value={searchTerm}
                            onChange={handleChange}
                        />
                        {searchTerm && (
                            <button
                                className="btn clear-btn"
                                onClick={() => {
                                    setSearchTerm("");
                                    setResults([]);
                                }}
                            >
                                <i className="fa fa-times"></i>
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="px-2">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} height={90} className="mb-3" borderRadius={10} />
                            ))}
                        </div>
                    ) : results.length === 0 && searchTerm.length > 1 ? (
                        <p className="text-center text-muted mt-5 fs-5">
                            No products found for “{searchTerm}”
                        </p>
                    ) : (
                        <div className="search-results">
                            {results.map((product) => {
                                // ✅ define variables here
                                const hasOffer =
                                    product.offer_percentage &&
                                    Number(product.offer_percentage) > 0 &&
                                    product.offer_price;

                                const outOfStock = !product.is_available || product.stock_quantity === 0;
                                const lowStock = product.stock_quantity <= 8 && product.stock_quantity > 0;

                                return (
                                    <div
                                        key={product.id}
                                        className="product-row d-flex align-items-center position-relative"
                                        style={outOfStock ? { opacity: 0.6, pointerEvents: "none" } : {}}
                                    >
                                        {/* === Offer / Stock Badges === */}
                                        {hasOffer && (
                                            <span className="offer">
                                                {Math.round(product.offer_percentage)}% OFF
                                            </span>
                                        )}

                                        {outOfStock ? (
                                            <span className="out-of-stock">
                                                Out of Stock
                                            </span>
                                        ) : lowStock ? (
                                            <span className="stock-hurry">
                                                Hurry! Only {product.stock_quantity} left
                                            </span>

                                        ) : null}

                                        {/* === Product Info === */}
                                        <div className="flex-grow-1">
                                            <h6 className="fw-semibold mb-1 text-dark">{product.product_name}</h6>
                                            <p className="text-muted small mb-1" style={{ maxWidth: "90%" }}>
                                                {product.product_description
                                                    ? product.product_description.slice(0, 50) + "..."
                                                    : ""}
                                            </p>

                                            {/* === Price Section === */}
                                            <div className="d-flex align-items-baseline gap-2">
                                                {hasOffer ? (
                                                    <>
                                                        <span
                                                            style={{
                                                                color: "#198754",
                                                                fontWeight: 700,
                                                                fontSize: "1rem",
                                                            }}
                                                        >
                                                            ₹ {parseFloat(product.offer_price).toLocaleString()}
                                                        </span>
                                                        <span
                                                            style={{
                                                                color: "#dc3545",
                                                                textDecoration: "line-through",
                                                                fontSize: "0.9rem",
                                                            }}
                                                        >
                                                            ₹ {parseFloat(product.price).toLocaleString()}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span
                                                        style={{
                                                            color: "#198754",
                                                            fontWeight: 600,
                                                            fontSize: "1rem",
                                                        }}
                                                    >
                                                        ₹ {parseFloat(product.price).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* === Product Image + Button === */}
                                        <div className="product-right d-flex flex-column align-items-end">
                                            <img
                                                src={product.product_image}
                                                alt={product.product_name}
                                                className="product-thumb"
                                            />
                                            <button
                                                className="btn-green-outline me-2 mb-2"
                                                onClick={() => navigate(`/product/${product.id}`)}
                                                disabled={outOfStock}
                                            >
                                                {outOfStock ? "Out" : "ADD"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    )}

                    {/* Bottom Back Button */}
                    <div className="text-center mt-4">
                        <button
                            className="btn-themed"
                            onClick={() => navigate(-1)}
                        >
                            BACK
                        </button>
                    </div>
                </div>

                {/* --- Right Section (Offers) --- */}
                <div className="col-lg-3 d-none d-lg-block">

                </div>
            </div>

            <style>{`
         .btn-green-outline {
          background-color: transparent;
          color: #198754 !important;
          border: 1.5px solid #198754;
          border-radius: 25px;
          padding: 5px 15px;
          font-weight: 600;
          transition: all 0.3s ease;
          text-decoration: none;
          
        }
        .btn-green-outline:disabled {
          background-color: #fff;
          color: #888 !important;
          border-color: #ccc !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
        }
        .btn-green-outline:hover {
          background-color: #198754;
          color: #fff !important;
          text-decoration: none;
        }
          .btn-themed {
          background-color: #198754;
          color: #fff;
          border-radius: 25px;
          border: none;
          padding: 8px 26px;
          font-weight: 500;
          transition: background-color 0.3s ease;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(122, 86, 58, 0.12);
        }
        .btn-themed:hover {
          background-color: #198754;
        }
        .btn-themed:focus, .btn-themed:active {
          background-color: #198754;
          outline: none;
          box-shadow: 0 0 7px rgba(122, 86, 58, 0.5);
        }
        /* --- Global Layout --- */
        .search-page-wrapper {
          min-height: 100vh;
          background: #fffaf4;
        }

        .info-box {
          background: #fff;
          border: 1.5px solid #e6d2b5;
          border-radius: 10px;
          padding: 15px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .info-list {
          padding-left: 16px;
          margin-bottom: 0;
        }
        .info-list li {
          margin-bottom: 6px;
          color: #555;
          font-size: 0.9rem;
        }

        .search-header {
          border-bottom: 1px solid #e6d2b5;
          padding-bottom: 8px;
        }
        .back-btn {
          background: none;
          border: none;
          color: #198754;
          font-size: 1.2rem;
        }

        .search-input-wrapper {
        background: transparent; 
        border: none;           
        border-radius: 10px;
        padding: 0;             
        box-shadow: none;
        }
        .search-icon {
        position: absolute;
        margin-left: 12px;
        color: #198754;
        font-size: 1rem;
        }
        .search-input {
        padding-left: 40px !important; 
        background: #fff;
        border: 1.5px solid #e6d2b5;
        border-radius: 10px;
        font-size: 1rem;
        height: 42px;
        box-shadow: none;
        }
        .clear-btn {
          background: none;
          border: none;
          color: #999;
          font-size: 1rem;
        }

        .product-row {
          border-bottom: 1px solid #eee;
          padding: 10px 0;
          display: flex;
          justify-content: space-between;
        }
        .product-thumb {
          width: 70px;
          height: 70px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #eee;
        }
        .add-btn {
          background: #fff;
          color: #000;
          border: 1px solid #198754;
          font-weight: 600;
          padding: 3px 12px;
          border-radius: 4px;
          font-size: 0.9rem;
          transition: 0.3s;
        }
        .add-btn:hover {
          background: #198754;
          color: #fff;
        }
        .back-bottom-btn {
          background: transparent;
          border: 1.5px solid #70a84d;
          color: #70a84d;
          border-radius: 6px;
          width: 200px;
          transition: 0.3s;
        }
        .back-bottom-btn:hover {
          background: #70a84d;
          color: white;
        }

        @media (max-width: 991px) {
          .info-box {
            display: none;
          }
        }

        .stock-hurry {
        position: absolute;
        top: 1px;
        left: 0px;
        background: #ffc107;
        color: #000;
        padding: 4px 8px;
        font-size: 0.7rem;
        font-weight: 600;
        border-radius: 5px;
        }

        @media (max-width: 768px) {
        .stock-hurry {
            left: 190px !important;
        }
        }
        .out-of-stock {
        position: absolute;
        top: 1px;
        left: 0px;
        background: #dc3545;
        color: #fff;
        padding: 4px 8px;
        font-size: 0.7rem;
        font-weight: 600;
        border-radius: 5px;
        }

        @media (max-width: 768px) {
        .out-of-stock {
            left: 215px !important;
        }
        }
        .offer {
        position: absolute;
        top: 75px;
        left: 20%;
        background: linear-gradient(135deg, #70a84d, #198754);
        color: #fff;
        padding: 3px 6px;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: 5px;
        }

        /* ✅ Mobile override */
        @media (max-width: 768px) {
        .offer {
            top :87px;
            left: 140px !important;
        }
        }


          
      `}</style>
        </div>
    );
};

export default SearchResults;
