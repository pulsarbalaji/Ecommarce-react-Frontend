import React, { useEffect, useState } from "react";
import api from "../utils/base_url";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { addCart, delCart } from "../redux/action";
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
    const [favorites, setFavorites] = useState([]);

    const [stockError, setStockError] = useState({});

    const { user } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const state = useSelector((state) => state.handleCart);

    const badgeStyle = {
        position: "absolute",
        top: "8px",
        left: "38%",
        transform: "translateX(-50%)",
        padding: "6px 14px",
        background: "#dc3545",
        color: "white",
        borderRadius: "20px",
        fontSize: "0.8rem",
        fontWeight: 600,
        zIndex: 99,
        whiteSpace: "nowrap",
        boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
    };

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
    const fetchFavorites = React.useCallback(async () => {
        if (!user) return;
        try {
            const res = await api.get(`favorites/ids/?auth_id=${user.id}`);
            setFavorites(res.data.favorites || []);
        } catch { }
    }, [user]);

    useEffect(() => {
        if (show) fetchFavorites();
    }, [show, fetchFavorites]);



    const toggleFavorite = async (productId) => {
        if (!user) {
            toast.error("Please login first!");
            navigate("/login");
            return;
        }

        try {
            const res = await api.post("favorites/toggle/", {
                product_id: productId,
                auth_id: user.id
            });
            const isFav = res.data.favorite;

            setFavorites((prev) =>
                isFav ? [...prev, productId] : prev.filter((id) => id !== productId)
            );
        } catch {
            toast.error("Failed. Try again.");
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

    const getCartQty = (productId) => {
        const item = state.find((p) => p.id === productId);
        return item ? item.qty : 0;
    };

    const addItem = (product) => {
        const availableStock = product.stock_quantity;

        if (availableStock && getCartQty(product.id) >= availableStock) {

            // Show error badge
            setStockError(prev => ({ ...prev, [product.id]: true }));

            // Auto-hide after 3 seconds
            setTimeout(() => {
                setStockError(prev => ({ ...prev, [product.id]: false }));
            }, 3000);

            return;
        }

        dispatch(addCart(product));
    };


    const removeItem = (product) => {
        dispatch(delCart(product));
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
                    background: "linear-gradient(180deg, rgb(112,168,77) 0%, rgb(112,168,77) 100%)",
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
                        "linear-gradient(180deg, rgb(112,168,77) 0%, rgb(112,168,77) 100%)";
                    e.currentTarget.style.transform = "translateX(-3px)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                        "linear-gradient(180deg, rgb(112,168,77) 0%, rgb(112,168,77) 100%)";
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
                        borderLeft: "12px solid rgb(112,168,77)",
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
                        className="offer-modal-content offer-modal-scope"

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
                            <h3 style={{ fontWeight: 700, color: "#198754", fontSize: "1.2rem", margin: 0 }}>Offer Products</h3>
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
                                style={{ borderRadius: 22, padding: "6px 16px", border: "1.3px solid #198754", background: selectedCat === "all" ? "#198754" : "#fff", color: selectedCat === "all" ? "#fff" : "#198754", fontWeight: 600, fontSize: ".95rem", transition: "all 0.3s", cursor: "pointer" }}
                                onClick={() => handleCategory("all")}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`cat-btn ${selectedCat === cat ? "active" : ""}`}
                                    style={{ borderRadius: 22, padding: "6px 16px", border: "1.3px solid #198754", background: selectedCat === cat ? "#198754" : "#fff", color: selectedCat === cat ? "#fff" : "#198754", fontWeight: 600, fontSize: ".95rem", transition: "all 0.3s", cursor: "pointer" }}
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
                                gridTemplateColumns: "repeat(2, 1fr)",
                                borderRadius: "12px"
                            }}
                        >
                            {loading
                                ? [...Array(4)].map((_, idx) => (
                                    <div key={idx} className="skeleton-card">
                                        <Skeleton height={280} />
                                    </div>
                                ))
                                : filtered.length === 0 ? (
                                    <div style={{ textAlign: "center", gridColumn: "span 2", color: "#198754", fontWeight: 600 }}>
                                        No offer products found.
                                    </div>

                                ) : (
                                    filtered.map((product, idx) => {
                                        const outOfStock = !product.is_available || product.stock_quantity === 0;
                                        const lowStock = product.stock_quantity <= 10 && product.stock_quantity > 0;
                                        return (
                                            <div
                                                key={product.id}
                                                className="product-card "

                                                onClick={() => {
                                                    setShow(false);        // close modal
                                                    navigate(`/product/${product.id}`);
                                                }}

                                            >
                                                {/* ❤️ Favorite Icon */}
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();   // prevent navigation
                                                        toggleFavorite(product.id);
                                                    }}
                                                    style={{
                                                        position: "absolute",
                                                        top: 10,
                                                        right: 10,
                                                        zIndex: 20,
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: "50%",
                                                        background: "rgba(255,255,255,0.9)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                                    }}
                                                >
                                                    {favorites.includes(product.id) ? "❤️" : "🤍"}
                                                </div>

                                                {/* 🔥 Offer Badge */}
                                                {product.offer_percentage && (
                                                    <span className="modal-offer-badge"
                                                        style={{
                                                            position: "absolute",
                                                            top: 140,
                                                            left: 0,
                                                            background: "linear-gradient(135deg, #70a84d, #198754)",
                                                            color: "#fff",
                                                            padding: "2px 5px",
                                                            fontSize: ".75rem",
                                                            fontweight: "600",
                                                            borderRadius: "0 6px 6px 0",
                                                            zIndex: 10
                                                        }}
                                                    >
                                                        {Math.round(product.offer_percentage)}% OFF
                                                    </span>
                                                )}
                                                {outOfStock && (
                                                    <span
                                                        style={{
                                                            position: "absolute",
                                                            top: 45,
                                                            left: 0,
                                                            background: "#dc3545",
                                                            color: "#fff",
                                                            padding: "4px 12px",
                                                            fontSize: "0.75rem",
                                                            fontWeight: 600,
                                                            borderRadius: "0 6px 6px 0",
                                                            zIndex: 12
                                                        }}
                                                    >
                                                        Out of Stock
                                                    </span>
                                                )}

                                                {!outOfStock && lowStock && (
                                                    <span
                                                        style={{
                                                            position: "absolute",
                                                            top: 10,
                                                            left: 0,
                                                            background: "#ffc107",
                                                            color: "#000",
                                                            padding: "4px 12px",
                                                            fontSize: "0.75rem",
                                                            fontWeight: 600,
                                                            borderRadius: "0 6px 6px 0",
                                                            zIndex: 12
                                                        }}
                                                    >
                                                        Hurry! Only {product.stock_quantity} left
                                                    </span>
                                                )}
                                                {stockError[product.id] && (
                                                    <motion.div
                                                        initial={{ x: 100, opacity: 0 }}
                                                        animate={{
                                                            x: [100, 0, -6, 6, -6, 6, 0],  // slide in + shake
                                                            opacity: 1,
                                                        }}
                                                        transition={{
                                                            duration: 0.6,
                                                            ease: "easeOut",
                                                        }}
                                                        exit={{
                                                            x: -100,
                                                            opacity: 0,
                                                            transition: { duration: 0.3 }
                                                        }}
                                                        style={badgeStyle}
                                                    >
                                                        Stock limit reached!
                                                    </motion.div>


                                                )}
                                                <div
                                                    className="img-wrapper"
                                                    style={{
                                                        height: 150,
                                                        background: "#fffaf4",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <img
                                                        src={process.env.REACT_APP_API_URL + product.product_image}
                                                        alt={product.product_name}
                                                        style={{
                                                            width: "80%",
                                                            height: "100%",
                                                            objectFit: "contain",
                                                            transition: "transform .32s",
                                                            backgroundColor: "#fff9f3",
                                                        }}
                                                        className="offer-img"
                                                    />
                                                </div>

                                                <div className="product-content" style={{ textAlign: "center", padding: 12 }}>
                                                    <h5 className="product-title" style={{ fontWeight: 700 }}>
                                                        {product.product_name.length > 15
                                                            ? product.product_name.slice(0, 15) + "..."
                                                            : product.product_name}
                                                    </h5>
                                                    <p className="product-desc">
                                                        {product.product_description.slice(0, 60)}...
                                                    </p>

                                                    <div className="product-price-wrap" style={{ marginTop: 8 }}>
                                                        {product.offer_price ? (
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

                                                <div className="d-flex justify-content-center pb-3">
                                                    <div className="product-btns" onClick={(e) => e.stopPropagation()}>
                                                        {product.stock_quantity === 0 ? (
                                                            <span className="out-stock-label">Out of Stock</span>
                                                        ) : getCartQty(product.id) === 0 ? (
                                                            <button
                                                                className="btn-buy"
                                                                onClick={() => addItem(product)}
                                                            >
                                                                Add to Cart
                                                            </button>
                                                        ) : (
                                                            <div className="qty-box">
                                                                <button
                                                                    className="qty-btn"
                                                                    onClick={() => removeItem(product)}
                                                                >
                                                                    <i className="fas fa-minus"></i>
                                                                </button>

                                                                <span className="qty-value">{getCartQty(product.id)}</span>

                                                                <button
                                                                    className="qty-btn"
                                                                    onClick={() => addItem(product)}
                                                                >
                                                                    <i className="fas fa-plus"></i>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
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
                                    color: "#198754",
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
                            <button
                                style={{
                                    borderRadius: 20,
                                    padding: "6px 18px",
                                    background: "#f1e6d4",
                                    color: "#198754",
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

             /* Only inside Offer Modal */
.offer-modal-scope .product-card {
  position: relative;
  background: #fff9f3;
  border-radius: 12px;
  overflow: hidden;
  border: 1.5px solid #e6d2b5;
}

/* Offer badge */
.offer-modal-scope .offer-badge {
  position: absolute;
  top: 10px;
  left: 0;
  background: linear-gradient(135deg, #70a84d, #198754);
  color: #fff;
  padding: 2px 5px;
  font-size: .75rem;
  font-weight: 600;
  border-radius: 0 6px 6px 0;
  z-index: 10;
}

/* Stock badge */
.offer-modal-scope .stock-badge {
  position: absolute;
  left: 0;
  top: 45px;
  padding: 4px 12px;
  border-radius: 0 6px 6px 0;
  font-weight: 600;
  font-size: 0.75rem;
  z-index: 12;
}

/* Image wrapper */
.offer-modal-scope .img-wrapper {
  height: 150px;
  background: #fffaf4;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Product description */
.offer-modal-scope .product-desc {
  color: #846e6eff;
  font-size: 0.85rem;
  line-height: 1.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

/* Product content */
.offer-modal-scope .product-content {
  padding: 12px;
  text-align: center;
}

/* Price styling */
.offer-modal-scope .product-price-offer {
  color: #198754;
  font-weight: 700;
}
.offer-modal-scope .product-price-original {
  color: #b33a3a;
  margin-left: 4px;
}
.offer-modal-scope .product-price {
  color: #198754;
  font-weight: 600;
}

/* Buttons inside modal */
.offer-modal-scope .btn-buy {
  background-color: rgb(112,168,77);
  color: #fff;
  border-radius: 25px;
  padding: 5px 12px;
  border: none;
}

.offer-modal-scope .btn-buy:hover {
  background-color: #95b25a;
}

.offer-modal-scope .btn-cart {
  background: #f1e6d4;
  color: #198754;
  border-radius: 25px;
  padding: 5px 12px;
  border: none;
}

        
          `}</style>
                </>
            )}
        </>
    );
};

export default OfferModal;
