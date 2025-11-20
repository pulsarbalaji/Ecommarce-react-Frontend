import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCart, delCart } from "../redux/action";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import toast from "react-hot-toast";
import api from "../utils/base_url";
import CategorySidebar from "./CategorySidebar";
import '../styles/index.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const [stockError, setStockError] = useState({});



  const sectionRefs = useRef({});
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const state = useSelector((state) => state.handleCart);


  const toggleFavorite = async (productId) => {
    if (!user) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }

    try {
      const res = await api.post("favorites/toggle/", { product_id: productId, auth_id: user.id });
      const isFav = res.data.favorite;

      setFavorites((prev) =>
        isFav ? [...prev, productId] : prev.filter((id) => id !== productId)
      );
      fetchFavorites();
    } catch (err) {
      console.error(err);
      toast.error("Failed, try again");
    }
  };

  const fetchFavorites = useCallback(async () => {
    if (!user) return;

    try {
      const res = await api.get(`favorites/ids/?auth_id=${user.id}`);
      setFavorites(res.data.favorites || []);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("categorylist/");
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  const fetchProducts = useCallback(async (categoryId = null) => {
    setLoading(true);
    try {
      const url = categoryId
        ? `productfilter/${categoryId}/`
        : `productlist/`;

      const res = await api.get(url);
      setProducts(res.data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchFavorites();

    // Only load all products if not coming from About
    if (!location.state?.categoryId) {
      fetchProducts();
    }
  }, [fetchCategories, fetchProducts, fetchFavorites, location.state]);

  const badgeStyle = {
    position: "absolute",
    top: "8px",
    left: "30%",
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

  useEffect(() => {
    if (!categories.length || !products.length) return;

    const handleScroll = () => {
      let currentCategory = null;
      let minDistance = Number.POSITIVE_INFINITY;

      Object.entries(sectionRefs.current).forEach(([catName, sectionEl]) => {
        if (!sectionEl) return;

        const rect = sectionEl.getBoundingClientRect();
        const distance = Math.abs(rect.top - 120); // 120px below navbar

        // Only consider sections that are ABOVE or very close to top
        if (rect.top <= 120 && distance < minDistance) {
          minDistance = distance;
          currentCategory = catName;
        }
      });

      if (currentCategory) {
        const catObj = categories.find(c => c.category_name === currentCategory);
        if (catObj && selectedCat !== catObj.id) {
          setSelectedCat(catObj.id);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Trigger once on load
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories, products, selectedCat]);


  useEffect(() => {
    const categoryId = location.state?.categoryId;

    if (!categoryId || !categories.length) return;

    // Set selected category
    setSelectedCat(categoryId);

    // Fetch products for this category
    fetchProducts(categoryId);

    // Wait until both categories and products are loaded
    const scrollToCategory = () => {
      const selectedCategory = categories.find((cat) => cat.id === categoryId);
      if (selectedCategory && sectionRefs.current[selectedCategory.category_name]) {
        const sectionEl = sectionRefs.current[selectedCategory.category_name];
        const yOffset = -100;
        const y = sectionEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    };

    // Use a small delay to ensure DOM sections are rendered
    const scrollTimeout = setTimeout(scrollToCategory, 1200);

    return () => clearTimeout(scrollTimeout);
  }, [location.state, categories, fetchProducts]);

  const Loading = () => (
    <div className="grid-container">
      {[...Array(6)].map((_, idx) => (
        <div key={idx} className="product-card skeleton-card" style={{ padding: "12px" }}>

          {/* Image Skeleton */}
          <Skeleton height={140} style={{ borderRadius: "10px" }} />

          {/* Title */}
          <Skeleton height={20} width={120} style={{ marginTop: "12px" }} />

          {/* Description (3 lines) */}
          <Skeleton height={12} width="90%" />
          <Skeleton height={12} width="85%" />
          <Skeleton height={12} width="80%" />

          {/* Price */}
          <Skeleton height={20} width={90} style={{ marginTop: "12px" }} />

          {/* Button / Qty */}
          <Skeleton height={35} width="60%" style={{ margin: "10px auto" }} />
        </div>
      ))}
    </div>
  );


  const getCartQty = (productId) => {
    const item = state.find((p) => p.id === productId);
    return item ? item.qty : 0;
  };

  const addItem = (product) => {
    const available = product.available_stock ?? product.stock_quantity;

    // If cart qty already reached available stock → block
    if (getCartQty(product.id) >= available) {
      setStockError(prev => ({ ...prev, [product.id]: true }));

      setTimeout(() => {
        setStockError(prev => ({ ...prev, [product.id]: false }));
      }, 3000);

      return;
    }

    // Add to cart
    dispatch(addCart(product));
  };



  const removeItem = (product) => {
    dispatch(delCart(product));
  };


  const ShowProducts = () => {
    // Group products by category name
    const groupedProducts = products.reduce((acc, product) => {
      const categoryName = product.category_name || "Uncategorized";
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(product);
      return acc;
    }, {});

    return (
      <>


        {/* Category-wise product sections */}
        {/* Sort product sections based on category order */}
        {categories
          .filter((cat) => groupedProducts[cat.category_name]) // only include categories that have products
          .map((cat) => {
            const categoryName = cat.category_name;
            const productList = groupedProducts[categoryName];
            return (
              <section
                key={categoryName}
                data-category={categoryName}
                ref={(el) => (sectionRefs.current[categoryName] = el)}
                className="mb-5"
              >
                <h2
                  style={{
                    color: "#000000ff",
                    display: "inline-block",
                    paddingBottom: "4px",
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    marginBottom: "15px",
                    textTransform: "uppercase",
                  }}
                >
                  {categoryName}
                </h2>

                <div className="grid-container">
                  {productList.map((product, idx) => {
                    const hasOffer =
                      product.offer_percentage &&
                      Number(product.offer_percentage) > 0 &&
                      product.offer_price;

                    const altCardClass = idx % 2 === 0 ? "card-even" : "card-odd";
                    const available = product.available_stock ?? product.stock_quantity;

                    const outOfStock = available === 0;
                    const stockLow = available <= 10 && available > 0;

                    return (
                      <div
                        key={product.id}
                        className={`product-card ${altCardClass}${outOfStock ? " out-of-stock" : ""}`}
                        style={outOfStock ? { opacity: 0.5, pointerEvents: "none" } : { cursor: "pointer" }}
                        onClick={() => {
                          if (!outOfStock) navigate(`/product/${product.id}`);
                        }}
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
                          <span className="stock-badge low-stock">
                            Hurry! Only {available} left
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


                        <div className="img-wrapper">
                          <img
                            src={`${process.env.REACT_APP_API_URL}${product.product_image}`}
                            alt={product.product_name}
                            style={{ backgroundColor: "#fff9f3" }}
                          />
                        </div>
                        <div className="product-content">
                          <h5 className="product-title">
                            {product.product_name.length > 15
                              ? product.product_name.substring(0, 15) + "..."
                              : product.product_name}
                          </h5>

                          <motion.div
                            onClick={(e) => {
                              e.stopPropagation(); // ✅ prevent navigation
                              toggleFavorite(product.id);
                            }}
                            initial={{ scale: 1 }}
                            animate={{
                              scale: favorites.includes(product.id) ? 1.15 : 1,
                            }}
                            transition={{ duration: 0.25 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                              position: "absolute",
                              top: "10px",
                              right: "10px",
                              cursor: "pointer",
                              zIndex: 50,
                            }}
                          >
                            <div
                              style={{
                                width: "26px",
                                height: "26px",
                                borderRadius: "50%",
                                backgroundColor: "rgba(255, 255, 255, 0.85)",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.3s ease",
                                backdropFilter: "blur(3px)",
                              }}
                            >
                              {favorites.includes(product.id) ? (
                                <motion.span
                                  animate={{ scale: [1, 1.3, 1] }}
                                  transition={{ duration: 0.3 }}
                                  style={{
                                    color: "#e63946",
                                    fontSize: "12px",
                                  }}
                                >
                                  ❤️
                                </motion.span>
                              ) : (
                                <span
                                  style={{
                                    color: "#6c757d",
                                    fontSize: "12px",
                                  }}
                                >
                                  🤍
                                </span>
                              )}
                            </div>
                          </motion.div>


                          <p className="product-desc">{product.product_description}</p>

                          <div className="product-price-wrap">
                            {hasOffer ? (
                              <>
                                <span className="product-price-offer">
                                  ₹ {parseFloat(product.offer_price).toLocaleString()}
                                </span>
                                <span className="product-price-original">
                                  <s>
                                    ₹ {parseFloat(product.price).toLocaleString()}
                                  </s>
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
                  })}
                </div>
              </section>
            );
          })}

      </>
    );
  };



  return (
    <div className="d-flex align-items-start">
      {/* Sidebar (desktop only) */}
      <div className="d-flex align-items-start products-wrapper">
        <div className="sidebar-follow">
          <CategorySidebar
            categories={categories}
            selectedCat={selectedCat}
            handleCategory={(id) => {
              const selectedCategory = categories.find(cat => cat.id === id);
              const sectionEl = sectionRefs.current[selectedCategory?.category_name];

              // CHECK: Does this category have any products ??
              const hasProducts = !!sectionEl;

              if (!hasProducts) {
                toast.error("No products available in this category!");
                return; // ❌ Stop scrolling
              }

              // If products exist → proceed normally
              setSelectedCat(id);

              const yOffset = -100;
              const y =
                sectionEl.getBoundingClientRect().top +
                window.pageYOffset +
                yOffset;

              window.scrollTo({ top: y, behavior: "smooth" });
            }}

          />
        </div>

        <div className="flex-grow-1 container my-4 py-3">
          <h2
            id="product-title"
            className="display-6 fw-bold text-center text-uppercase mb-4"
            style={{ color: "#198754" }}
          >
            Our Products
          </h2>
          {loading ? <Loading /> : <ShowProducts />}
        </div>
      </div>


      <style>{`

        .skeleton-card {
        background: #fff9f3;
        border-radius: 12px;
        border: 1.5px solid #e6d2b5;
        height: 340px;          /* Match exact card height */
        display: flex;
        flex-direction: column;
        justify-content: start;
        gap: 8px;
      }


      /* --- Sticky Sidebar Follow --- */
        .sidebar-follow {
          position: sticky;
          top: 90px; /* height of your navbar */
          align-self: flex-start;
          transition: all 0.3s ease;
          z-index: 10;
          scroll-behavior: smooth;
        }

        /* Scrollbar styling inside sidebar */
        .sidebar-follow::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-follow::-webkit-scrollbar-thumb {
          background-color: #d8c6b2;
          border-radius: 10px;
        }
        .sidebar-follow::-webkit-scrollbar-track {
          background: transparent;
        }

        /* Make sure it aligns correctly on desktop only */
        @media (max-width: 992px) {
          .sidebar-follow {
            display: none;
          }
        }

        /* Keep the two columns aligned */
        .products-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 20px;
        }

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
          top: 140px;
          right: 160;
          background: linear-gradient(135deg, #70a84d, #198754);
          color: #fff;
          padding: 2px 5px;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 0 6px 6px 0;
          box-shadow: 0 2px 5px rgba(0,0,0,0.15);
          z-index: 10;
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
          border-radius: 0 6px 6px 0;
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
        .product-card:hover img { transform: scale(1.15); }

        .product-content {
          text-align: center;
          padding: 10px 12px;
          flex-grow: 1;
        }
        .product-title { font-weight: 600; font-size: 1.10rem; color: #000000ff; margin-bottom: 4px; }
        .product-desc {
        color: #846e6eff;
        font-size: 0.85rem;
        line-height: 1.25rem;
        text-align: left; /* ensures all lines start at same position */
        
        display: -webkit-box;
        -webkit-line-clamp: 3;          /* show exactly 3 lines */
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: normal;

        max-height: calc(1.25rem * 3);  /* ensures only 3 visible lines */
        margin-top: 4px;
      }
        .product-price-wrap {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 10px;
          margin-top: 6px;
          white-space: nowrap;
        }
        .product-price { color: rgba(0, 0, 0, 1); font-weight: bold; font-size: 1rem; }
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

      .qty-box {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #fff;
        border: 1.5px solid #198754;
        border-radius: 25px;
        padding: 4px 10px;
      }

      .qty-btn {
        background: #198754;
        color: white;
        border: none;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .qty-value {
        font-weight: 700;
        font-size: 1rem;
        color: #198754;
      }

      .out-stock-label {
        background: #dc3545;
        color: white;
        padding: 6px 14px;
        border-radius: 25px;
        font-weight: 600;
        font-size: 0.85rem;
        display: inline-block;
      }
      `}</style>
    </div>
  );
};

export default Products;
