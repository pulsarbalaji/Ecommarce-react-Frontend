import React, { useEffect, useState } from "react";
import api from "../utils/base_url";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const OfferModal = () => {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCat, setSelectedCat] = useState("all");
    const [filtered, setFiltered] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const { user } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // API call for offer products by page/category
    const fetchOfferProducts = async (pageNo = 1, category = null) => {
        setLoading(true);
        try {
            let url = `productlist/?offer_only=true&page=${pageNo}`;
            const res = await api.get(url);
            setPage(res.data.current_page || 1);
            setTotalPages(res.data.total_pages || 1);
            const cats = Array.from(new Set(res.data.data.map(prod => prod.category_name)));
            setCategories(cats);
            setFiltered(
                category && category !== "all"
                    ? res.data.data.filter(prod => prod.category_name === category)
                    : res.data.data
            );
        } catch (err) {
            setFiltered([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) fetchOfferProducts(page, selectedCat);
    }, [show, page, selectedCat]);

    const handleCategory = cat => {
        setSelectedCat(cat);
        setPage(1); // Reset to page 1 when category changes
        fetchOfferProducts(1, cat);
    };

    const handlePageChange = pageNum => {
        setPage(pageNum);
    };

    const addProduct = (product) => {
        if (user) {
            dispatch(addCart(product));
            toast.success("Added to cart");
        } else {
            toast.error("Please login first!");
            navigate("/login");
        }
    };

    const isMobile = window.innerWidth <= 767;

    return (
        <>
            {/* --- Floating Offers Tab with Discount Tag Icon --- */}
            <button
                onClick={() => setShow(true)}
                style={{
                    position: "fixed",
                    right: 0,
                    top: "45%",
                    zIndex: 3000,
                    background: "linear-gradient(180deg, #43a047 0%, #2e7d32 100%)",
                    color: "#fff",
                    fontWeight: 700,
                    height: 110,
                    width: 36,
                    border: "none",
                    outline: "none",
                    cursor: "pointer",
                    borderRadius: "10px 0 0 10px",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                        "linear-gradient(180deg, #4caf50 0%, #2e7d32 100%)";
                    e.currentTarget.style.transform = "translateX(-3px)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                        "linear-gradient(180deg, #43a047 0%, #2e7d32 100%)";
                    e.currentTarget.style.transform = "translateX(0)";
                }}
            >
                <div
                    style={{
                        transform: "rotate(-90deg) translateY(6px)", // <-- pushes content down a bit after rotation
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                    }}
                >
                    <span
                        style={{
                            letterSpacing: "1.2px",
                            fontSize: "1rem",
                            fontFamily: "'Poppins', sans-serif",
                            lineHeight: 1,
                            userSelect: "none",
                        }}
                    >
                        Offers
                    </span>

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1.3em"
                        height="1.3em"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ color: "#fff" }}
                    >
                        <path d="M2 3a1 1 0 0 1 1-1h8a1 1 0 0 1 .707.293l10 10a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-10-10A1 1 0 0 1 2 11V3zm2 1v6.586l9 9L19.586 13l-9-9H4z" />
                        <path d="M9 7.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0z" />
                    </svg>
                </div>

                {/* Bottom angled cut */}
                <span
                    style={{
                        position: "absolute",
                        right: 0,
                        bottom: 0,
                        width: 0,
                        height: 0,
                        borderBottom: "12px solid transparent",
                        borderLeft: "12px solid #2e7d32",
                    }}
                />
            </button>




            {/* --- Modal --- */}
            {show && (
                <>
                    <div
                        className="offer-modal-backdrop"
                        onClick={() => setShow(false)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(80, 38, 17, 0.21)",
                            zIndex: 5020,
                        }}
                    ></div>
                    <div
                        className="offer-modal-content"
                        style={{
                            position: "fixed",
                            right: 0,
                            top: isMobile ? "auto" : 0,
                            bottom: isMobile ? 0 : "auto",
                            width: isMobile ? "100vw" : "48vw",
                            height: isMobile ? "100vh" : "100vh",
                            borderRadius: isMobile ? "24px 24px 0 0" : "16px 0px 0px 16px",
                            boxShadow: "0 8px 24px rgba(122,86,58,.10)",
                            background: "#fffaf4",
                            zIndex: 5022,
                            display: "flex",
                            flexDirection: "column",
                            overflow: "auto",
                            animation: isMobile ? "slideUpOffer .42s" : "slideLeftOffer .32s",
                            maxWidth: isMobile ? "100vw" : "470px",
                            maxHeight: "100vh",
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div
                            className="modal-header-themed"
                            style={{
                                padding: "22px 22px 0 22px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }}
                        >
                            <h3 style={{ fontWeight: 700, color: "#6b4226", fontSize: "1.2rem", margin: 0 }}>Offer Products</h3>
                            <button
                                className="btn-close-themed"
                                style={{ fontSize: "2rem", border: "none", background: "transparent", cursor: "pointer", color: "#6b4226", fontWeight: 700 }}
                                onClick={() => setShow(false)}
                            >
                                ×
                            </button>
                        </div>
                        {/* Category Group */}
                        <div style={{ padding: "18px 18px 0 18px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            <button
                                className={`cat-btn ${selectedCat === "all" ? "active" : ""}`}
                                style={{ borderRadius: 22, padding: "6px 16px", border: "1.3px solid #7a563a", background: selectedCat === "all" ? "#7a563a" : "#fff", color: selectedCat === "all" ? "#fff" : "#7a563a", fontWeight: 600, fontSize: ".95rem", transition: "all 0.3s", cursor: "pointer" }}
                                onClick={() => handleCategory("all")}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`cat-btn ${selectedCat === cat ? "active" : ""}`}
                                    style={{ borderRadius: 22, padding: "6px 16px", border: "1.3px solid #7a563a", background: selectedCat === cat ? "#7a563a" : "#fff", color: selectedCat === cat ? "#fff" : "#7a563a", fontWeight: 600, fontSize: ".95rem", transition: "all 0.3s", cursor: "pointer" }}
                                    onClick={() => handleCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        {/* Grid */}
                        <div
                            className="offer-grid"
                            style={{
                                display: "grid",
                                gap: "18px",
                                padding: "18px 14px",
                                gridTemplateColumns: "repeat(2, 1fr)"
                            }}
                        >
                            {loading
                                ? [...Array(4)].map((_, idx) => (
                                    <div key={idx} className="skeleton-card">
                                        <Skeleton height={280} />
                                    </div>
                                ))
                                : filtered.length === 0 ? (
                                    <div style={{ textAlign: "center", gridColumn: "span 2", color: "#7a563a", fontWeight: 600 }}>
                                        No offer products found.
                                    </div>
                                ) : (
                                    filtered.map((product, idx) => {
                                        const hasOffer = !!product.offer_percentage && !!product.offer_price;
                                        const altCardClass = idx % 2 === 0 ? "card-even" : "card-odd";
                                        return (
                                            <div
                                                key={product.id}
                                                className={`product-card shadow-sm ${altCardClass}`}
                                                style={{
                                                    position: "relative",
                                                    background: idx % 2 === 0 ? "#fffaf6" : "#fdf6f0",
                                                    border: "1.5px solid #f1e6d4",
                                                    borderRadius: "12px",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    justifyContent: "space-between",
                                                    height: 340,
                                                    minHeight: 340,
                                                    transition: "transform 0.3s, box-shadow 0.3s",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {hasOffer && (
                                                    <span className="offer-badge"
                                                        style={{
                                                            position: "absolute",
                                                            top: 10,
                                                            right: 0,
                                                            background: "linear-gradient(135deg, #ff4b2b, #ff416c)",
                                                            color: "#fff",
                                                            padding: "4px 10px",
                                                            fontSize: "0.75rem",
                                                            fontWeight: 600,
                                                            borderRadius: "6px",
                                                            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
                                                            zIndex: 5,
                                                            letterSpacing: "0.3px"
                                                        }}>
                                                        {Math.round(product.offer_percentage)}% OFF
                                                    </span>
                                                )}
                                                <div className="img-wrapper" style={{
                                                    background: "#fffaf4",
                                                    height: 150,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center"
                                                }}>
                                                    <img
                                                        src={process.env.REACT_APP_API_URL + product.product_image}
                                                        alt={product.product_name}
                                                        style={{
                                                            width: "80%",
                                                            height: "100%",
                                                            objectFit: "contain",
                                                            transition: "transform 0.3s"
                                                        }}
                                                    />
                                                </div>
                                                <div className="product-content" style={{ textAlign: "center", padding: "10px 12px", flexGrow: 1 }}>
                                                    <h5 className="product-title" style={{ fontWeight: 600, fontSize: "0.95rem", color: "#5b3b25", marginBottom: 4 }}>
                                                        {product.product_name.length > 15
                                                            ? product.product_name.substring(0, 15) + "..."
                                                            : product.product_name}
                                                    </h5>
                                                    <p className="product-desc" style={{ color: "#777", fontSize: "0.85rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                                        {product.product_description.length > 70
                                                            ? product.product_description.substring(0, 70) + "..."
                                                            : product.product_description}
                                                    </p>
                                                    <div className="product-price-wrap" style={{ display: "flex", alignItems: "baseline", gap: "10px", justifyContent: "center", flexWrap: "nowrap", whiteSpace: "nowrap", marginTop: 8 }}>
                                                        {hasOffer ? (
                                                            <>
                                                                <span className="product-price-offer" style={{ color: "#28a745", fontSize: "1.17rem", fontWeight: 700 }}>
                                                                    ₹ {parseFloat(product.offer_price).toLocaleString()}
                                                                </span>
                                                                <span className="product-price-original" style={{ fontSize: "0.93rem", color: "#dc3545", fontWeight: 400, marginLeft: 4 }}>
                                                                    <s>₹ {parseFloat(product.price).toLocaleString()}</s>
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="product-price" style={{ fontSize: "1rem", color: "#7a563a", fontWeight: "bold" }}>
                                                                ₹ {parseFloat(product.price).toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div
                                                    className="d-flex justify-content-center gap-2 pb-3"
                                                    style={{
                                                        marginTop: "auto",
                                                        flexWrap: "nowrap",   // prevent wrapping to two rows
                                                        overflowX: "hidden",    // allow horizontal scroll if needed on small screens
                                                    }}
                                                >
                                                    <Link
                                                        to={`/product/${product.id}`}
                                                        className="btn-buy"
                                                        style={{
                                                            borderRadius: 20,
                                                            padding: "4px 10px",
                                                            backgroundColor: "#7a563a",
                                                            color: "#fff",
                                                            fontSize: "0.78rem",
                                                            fontWeight: 500,
                                                            textDecoration: "none",
                                                            flex: "0 0 auto",    // fixed size so buttons don't stretch or shrink
                                                            minWidth: 80,
                                                            textAlign: "center",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                        onClick={() => setShow(false)}
                                                    >
                                                        Buy Now
                                                    </Link>
                                                    <button
                                                        className="btn-cart"
                                                        style={{
                                                            borderRadius: 20,
                                                            padding: "4px 10px",
                                                            backgroundColor: "#f1e6d4",
                                                            color: "#7a563a",
                                                            fontSize: "0.78rem",
                                                            fontWeight: 500,
                                                            border: "none",
                                                            flex: "0 0 auto",    // fixed size to keep same as above
                                                            minWidth: 80,
                                                            textAlign: "center",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                        onClick={() => addProduct(product)}
                                                    >
                                                        Add to Cart
                                                    </button>
                                                </div>


                                            </div>
                                        );
                                    })
                                )}
                        </div>
                        {/* Pagination */}
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "16px",
                            padding: "12px 12px 28px",
                            width: "100%"
                        }}>
                            <button
                                style={{
                                    borderRadius: 20,
                                    padding: "6px 18px",
                                    background: "#f1e6d4",
                                    color: "#7a563a",
                                    border: "none",
                                    fontWeight: 600,
                                    fontSize: "0.92rem",
                                    cursor: page === 1 ? "not-allowed" : "pointer",
                                    opacity: page === 1 ? 0.7 : 1
                                }}
                                disabled={page === 1}
                                onClick={() => handlePageChange(page - 1)}
                            >
                                ‹ Prev
                            </button>
                            {/* <span style={{ color: "#7a563a", fontWeight: 600 }}>
                Page {page} of {totalPages}
              </span> */}
                            <button
                                style={{
                                    borderRadius: 20,
                                    padding: "6px 18px",
                                    background: "#f1e6d4",
                                    color: "#7a563a",
                                    border: "none",
                                    fontWeight: 600,
                                    fontSize: "0.92rem",
                                    cursor: page === totalPages ? "not-allowed" : "pointer",
                                    opacity: page === totalPages ? 0.7 : 1
                                }}
                                disabled={page === totalPages}
                                onClick={() => handlePageChange(page + 1)}
                            >
                                Next ›
                            </button>
                        </div>
                    </div>
                    <style>{`
            @keyframes slideLeftOffer {
              from {transform: translateX(100vw);}
              to {transform: translateX(0);}
            }
            @keyframes slideUpOffer {
              from {transform: translateY(100vh);}
              to {transform: translateY(0);}
            }
            @media (max-width: 768px) {
              .offer-vertical-label {
                height: 90px !important;
                width: 42px !important;
                font-size: 0.9rem !important;
              }
              .offer-vertical-label span {
                font-size: 0.9rem !important;
              }
            }
            @media (max-width: 480px) {
              .offer-vertical-label {
                height: 75px !important;
                width: 38px !important;
              }
              .offer-vertical-label span {
                font-size: 0.8rem !important;
              }
            }
              /* In your CSS file or inside <style> tag */
@media (max-width: 576px) {
  .btn-buy,
  .btn-cart {
     padding: 4px 10px !important;
    font-size: 0.72rem !important;
    min-width: 70px !important;
    border-radius: 16px !important;
  }
}

               .btn-buy, .btn-cart {
          border: none; border-radius: 25px; padding: 5px 12px;
          font-size: 0.8rem; font-weight: 500; transition: all 0.3s ease;
        }
        .btn-buy { background-color: #7a563a; color: #fff; }
        .btn-buy:hover { background-color: #68492f; }
          `}</style>
                </>
            )}
        </>
    );
};

export default OfferModal;
