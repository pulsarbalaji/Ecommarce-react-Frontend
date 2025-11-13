import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCart } from "../redux/action";
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


  const sectionRefs = useRef({});
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const state = useSelector((state) => state.handleCart);

  const addProduct = (product) => {
    if (!user) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }

    if (!product.is_available || product.stock_quantity === 0) {
      toast.error("This product is out of stock!");
      return;
    }

    // Check current quantity of this product in cart (from Redux)
    const cartItem = state.find((item) => item.id === product.id);
    const currentQty = cartItem ? cartItem.qty : 0;

    if (currentQty >= product.stock_quantity) {
      toast.error(`Only ${product.stock_quantity} in stock`);
      return;
    }

    dispatch(addCart(product));
    toast.success("Added to cart");
  };

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

  useEffect(() => {
    if (!products.length || !categories.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible section
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          const categoryName = visible.target.getAttribute("data-category");
          const catObj = categories.find(
            (cat) => cat.category_name === categoryName
          );
          if (catObj && selectedCat !== catObj.id) {
            setSelectedCat(catObj.id); // ✅ auto-select sidebar category
          }
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -65% 0px",
        threshold: 0.2, // adjust for sensitivity
      }
    );

    Object.values(sectionRefs.current).forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
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
        <div key={idx} className="skeleton-card">
          <Skeleton height={280} />
        </div>
      ))}
    </div>
  );


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
                    const outOfStock =
                      !product.is_available || product.stock_quantity === 0;
                    const stockLow =
                      product.stock_quantity <= 10 && product.stock_quantity > 0;

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
                            Hurry! Only {product.stock_quantity} left
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
                   
                          <button
                            className="btn-buy"
                            onClick={(e) => {
                              e.stopPropagation(); // ✅ prevent card navigation
                              addProduct(product);
                            }}
                            disabled={outOfStock}
                            style={
                              outOfStock
                                ? { pointerEvents: "none", opacity: 0.7 }
                                : {}
                            }
                          >
                            {outOfStock ? "Out of Stock" : "Add to Cart"}
                          </button>
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
              setSelectedCat(id);
              const selectedCategory = categories.find((cat) => cat.id === id);
              const sectionEl =
                sectionRefs.current[selectedCategory?.category_name];
              if (sectionEl) {
                const yOffset = -100;
                const y =
                  sectionEl.getBoundingClientRect().top +
                  window.pageYOffset +
                  yOffset;
                window.scrollTo({ top: y, behavior: "smooth" });
              }
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
          right: 150;
          background: linear-gradient(135deg, #70a84d, #198754);
          color: #fff;
          padding: 2px 5px;
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
     
      `}</style>
    </div>
  );
};

export default Products;
