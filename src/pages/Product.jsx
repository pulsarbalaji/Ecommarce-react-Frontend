import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addCart } from "../redux/action";
import { Footer, Navbar } from "../components";
import api from "../utils/base_url";
import toast from "react-hot-toast";

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [stocks, setStocks] = useState({});
  const [variants, setVariants] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [feedbackProductId, setFeedbackProductId] = useState(null);
  const [showDescModal, setShowDescModal] = useState(false);




  const navigate = useNavigate();


  const dispatch = useDispatch();
  const cart = useSelector((s) => s.handleCart || []); // read current cart from redux

  // Add to cart with stock checks
  const addProduct = (prod) => {
    const productId = prod.id;
    const availableStock = Number(stocks[productId] ?? prod.stock_quantity ?? 0);

    if (availableStock <= 0) {
      toast.error(`${prod.product_name} is out of stock`);
      return;
    }

    const existingItem = cart.find((i) => Number(i.id) === Number(productId));
    const currentQty = existingItem ? Number(existingItem.qty) : 0;

    if (currentQty >= availableStock) {
      toast.error(`Only ${availableStock} in stock for ${prod.product_name}`);
      return;
    }

    dispatch(addCart(prod));
    toast.success("Added to cart");
  };

  // Fetch main product and similar products
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setLoadingSimilar(true);
      try {
        const res = await api.get(`/productlist/${id}/`);
        const data = res.data?.data;
        setProduct(data);
        if (data && !data.parent) {
          try {
            const resVar = await api.get(`/productvariantfillter/?parent_id=${data.id}`);
            setVariants(resVar.data?.data || []);
          } catch (err) {
            console.error("Failed to load variants", err);
          }
        }

        setLoading(false);

        if (data?.category) {
          const resSimilar = await api.get(`/productfilter/${data.category}/?page=1`);
          const dataSimilar = resSimilar.data?.data || [];
          setSimilarProducts(dataSimilar.filter((item) => item.id !== data.id));
        } else {
          setSimilarProducts([]);
          setLoadingSimilar(false);
        }
        setLoadingSimilar(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
        setLoadingSimilar(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // Fetch stock for main product + similar products
  useEffect(() => {
    const getStock = async () => {
      try {
        const stockData = {};

        if (product?.id) {
          // leading slash to be safe — adjust if your api base expects otherwise
          const resMain = await api.get(`/stock/?product_id=${product.id}`);
          stockData[product.id] = Number(resMain.data?.stock ?? product.stock_quantity ?? 0);
        }

        // fetch stocks in parallel for similar products
        const similarIds = similarProducts.map((p) => p.id);
        if (similarIds.length > 0) {
          const promises = similarIds.map((pid) =>
            api.get(`/stock/?product_id=${pid}`).then((r) => ({
              id: pid,
              stock: Number(r.data?.stock ?? 0),
            })).catch((err) => {
              console.error(`Stock fetch error for ${pid}`, err);
              return { id: pid, stock: Number(similarProducts.find(sp => sp.id === pid)?.stock_quantity ?? 0) };
            })
          );

          const results = await Promise.all(promises);
          results.forEach((r) => {
            stockData[r.id] = r.stock;
          });
        }

        setStocks((prev) => ({ ...prev, ...stockData }));
      } catch (error) {
        console.error("Stock fetch error:", error);
      }
    };

    // Only run when we have product or similar products
    if (product || (similarProducts && similarProducts.length > 0)) {
      getStock();
    }
  }, [product, similarProducts]);

  const LoadingProduct = () => (
    <div className="container my-5 py-2">
      <div className="row">
        <div className="col-md-6 py-3">
          <Skeleton height={350} width={350} />
        </div>
        <div className="col-md-6 py-5">
          <Skeleton height={25} width={200} />
          <Skeleton height={80} />
          <Skeleton height={35} width={70} />
          <Skeleton height={40} width={110} />
          <Skeleton height={100} />
          <Skeleton height={35} width={110} inline={true} />
          <Skeleton className="mx-3" height={35} width={110} />
        </div>
      </div>
    </div>
  );

  const ShowProduct = () => {
    if (!product) return null;
    const hasOffer =
      product.offer_price !== null &&
      product.offer_price > 0 &&
      product.offer_price !== product.price;

    const available = Number(stocks[product.id] ?? product.stock_quantity ?? 0);
    const outOfStock = !product.is_available || available === 0;
    const stockLow = available <= 10 && available > 0;

    return (
      <div className="container my-5 py-2">
        <div className="row align-items-center">
          <div className="col-md-6 col-sm-12 py-3 text-center">
            <div className="product-image-wrapper" style={{ position: "relative" }}>
              <img
                className="img-fluid"
                src={`${process.env.REACT_APP_API_URL}${product.product_image}`}
                alt={product.product_name}
                style={{ objectFit: "contain", maxHeight: "350px" }}
              />
              {outOfStock && (
                <span className="stock-badge out-stock">Out of Stock</span>
              )}
              {!outOfStock && stockLow && (
                <span className="stock-badge low-stock">
                  Hurry! Only {available} left
                </span>
              )}
            </div>
          </div>
          <div className="col-md-6 py-3">
            <h6 className="text-uppercase" style={{ color: "#000000ff" }} > {product.category_name}</h6>
            <h3 className="fw-bold text-success">{product.product_name}</h3>
            <p className="mb-2 d-flex align-items-center gap-2" style={{ color: "#000000ff" }}>
              Rating: {product.average_rating} <i className="fa fa-star text-warning"></i>
              <button
                className="btn btn-link p-0 text-success fw-semibold"
                onClick={() => openReviewModal(product.id)}
              >
                View Reviews
              </button>
            </p>

            <h4 className="text-success my-2">
              {hasOffer ? (
                <>
                  ₹{parseFloat(product.offer_price).toLocaleString()}{" "}
                  <small className="text-danger text-decoration-line-through">
                    ₹{parseFloat(product.price).toLocaleString()}
                  </small>
                </>
              ) : (
                `₹${parseFloat(product.price).toLocaleString()}`
              )}
            </h4>
            <p
              className="small product-desc"
              style={{
                minHeight: "70px",
                color: "#000000ff",
                whiteSpace: "pre-line", // ✅ preserves line breaks
              }}
            >
              {product.product_description?.length > 250
                ? product.product_description.slice(0, 250) + "..."
                : product.product_description}

              {product.product_description && product.product_description.length > 250 && (
                <span
                  onClick={() => {
                    console.log("Opening modal...");
                    setShowDescModal(true);
                  }}
                  style={{
                    color: "#198754",
                    fontWeight: "600",
                    cursor: "pointer",
                    marginLeft: "6px",
                  }}
                >
                  Read more
                </span>
              )}
            </p>


            <p className="small mb-2" style={{ color: "#000000ff" }}>

            </p>
            {variants.length > 0 && (
              <div className="variant-section mt-4">
                <h6 className="fw-bold text-success mb-3">Available :</h6>
                <div className="d-flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => navigate(`/product/${v.id}`)}
                      className={`variant-btn ${Number(id) === Number(v.id) ? "active" : ""
                        }`}
                    >
                      {v.quantity} {v.quantity_unit}
                    </button>
                  ))}
                </div>
              </div>
            )}


            <div className="d-flex flex-wrap">
              <button
                className="btn-green-outline me-2 mb-2"
                onClick={() => addProduct(product)}
                disabled={outOfStock}
                style={outOfStock ? { pointerEvents: "none", opacity: 0.7 } : {}}
              >
                Add to Cart
              </button>
              <Link
                to="/cart"
                className="btn-green mb-2"
                tabIndex={outOfStock ? -1 : 0}
                style={outOfStock ? { pointerEvents: "none", opacity: 0.7 } : {}}
              >
                Go to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LoadingSimilar = () => (
    <div className="scroll-container my-4 py-3">
      {[...Array(5)].map((_, idx) => (
        <div key={idx} className="card skeleton-card">
          <Skeleton height={180} width={140} />
        </div>
      ))}
    </div>
  );

  const ShowSimilarProducts = () => (
    <div className="my-5 container">
      <h4 className="mb-3 text-success fw-bold">You may also like</h4>
      <div className="scroll-container">
        {similarProducts.map((item) => {
          const hasOffer =
            item.offer_price !== null &&
            Number(item.offer_price) > 0 &&
            item.offer_price !== item.price;

          const available = Number(stocks[item.id] ?? item.stock_quantity ?? 0);
          const outOfStock = !item.is_available || available === 0;
          const stockLow = available <= 10 && available > 0;

          return (
            <div
              key={item.id}
              className="card text-center border-0 shadow-sm rounded product-card-theme"
              style={
                outOfStock
                  ? { opacity: 0.5, pointerEvents: "none" }
                  : {}
              }
              onClick={() => {
                if (!outOfStock) navigate(`/product/${item.id}`);
              }}
            >
              {hasOffer && (
                <div className="offer-badge">
                  {Math.round(item.offer_percentage)}% OFF
                </div>
              )}
              {outOfStock && (
                <span className="stock-badge out-stock">Out of Stock</span>
              )}
              {!outOfStock && stockLow && (
                <span className="stock-badge low-stock">
                  Hurry! Only {available} left
                </span>
              )}
              <div className="p-2 bg-light rounded position-relative">
                <img
                  className="card-img-top"
                  src={`${process.env.REACT_APP_API_URL}${item.product_image}`}
                  alt={item.product_name}
                  height={120}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div className="card-body p-2">
                <h6 className="card-title text-success small text-truncate">
                  {item.product_name.length > 18
                    ? item.product_name.substring(0, 18) + "..."
                    : item.product_name}
                </h6>
                <p className="text-success small">
                  {hasOffer ? (
                    <>
                      ₹{parseFloat(item.offer_price).toLocaleString()}{" "}
                      <small className="text-danger text-decoration-line-through ms-1">
                        ₹{parseFloat(item.price).toLocaleString()}
                      </small>
                    </>
                  ) : (
                    `₹${parseFloat(item.price).toLocaleString()}`
                  )}
                </p>

                <p className="small mb-1" style={{ color: "#000000ff" }}>

                </p>

                <div className="d-flex justify-content-center flex-wrap">
                  <button
                    className="btn-green btn-sm mb-2"
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ Prevent navigation when adding to cart
                      addProduct(item);
                    }}
                    disabled={outOfStock}
                    style={outOfStock ? { pointerEvents: "none", opacity: 0.7 } : {}}
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
  const openReviewModal = (productId) => {
    setFeedbackProductId(productId);
    setShowReviewModal(true);
    fetchReviews(productId, 1);
  };

  const fetchReviews = async (productId, pageNo = 1) => {
    setLoadingReviews(true);
    try {
      const res = await api.get(`/product-feedback-list/${productId}/?page=${pageNo}`);
      const pageData = res.data;
      const data = pageData?.results?.data || [];
      setReviews(data);
      setPage(pageNo);
      setHasNext(Boolean(pageData?.next));
    } catch (err) {
      console.error("Review fetch failed:", err);
      toast.error("Failed to load reviews");
    } finally {
      setLoadingReviews(false);
    }
  };


  return (
    <>
      <Navbar />
      <div style={{ backgroundColor: "#fffaf4", minHeight: "100vh" }}>
        {loading || !product ? <LoadingProduct /> : <ShowProduct />}
        {loadingSimilar ? <LoadingSimilar /> : <ShowSimilarProducts />}
      </div>
      <Footer />

      {/* Theme Styles */}
      <style>{`
     /* 🖼️ FIXED IMAGE BOX */
.product-image-wrapper {
  background: #fffaf4;
  border: 1.5px solid #e6d2b5;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  position: relative;

  /* ✅ fixed height for all product image boxes */
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* prevents large images from escaping box */
}

.product-image-wrapper img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain; /* keeps aspect ratio and fits perfectly */
  display: block;
}

        .stock-badge {
          position: absolute;
          left: 10px;
          bottom: 115px;
          background: #ffc107;
          color: #7a563a;
          padding: 4px 12px;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 6px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.14);
          z-index: 9;
        }
        .stock-badge.low-stock {
          background: #ffc107;
          color: #000000ff;
        }
        .stock-badge.out-stock {
          background: #dc3545;
          color: #fff;
        }
        .offer-badge {
          position: absolute;
          top: 10px;
          right: 0;
          background: linear-gradient(135deg, #70a84d, #198754);
          color: #fff;
          padding: 2px 5px;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 6px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.15);
          z-index: 5;
        }
        .scroll-container {
          display: flex;
          overflow-x: auto;
          gap: 15px;
          padding-bottom: 12px;
          scrollbar-width: thin;
          scrollbar-color: #198754 #f1e6d4;
        }
        .scroll-container::-webkit-scrollbar {
          height: 8px;
        }
        .scroll-container::-webkit-scrollbar-track {
          background: #f1e6d4;
          border-radius: 10px;
        }
        .scroll-container::-webkit-scrollbar-thumb {
          background: #198754;
          border-radius: 10px;
        }
        .product-card-theme {
          flex: 0 0 160px;
          background: #fff9f3;
          border-radius: 12px;
          border: 1.5px solid #e6d2b5;
          box-shadow: 0 2px 7px rgba(0,0,0,0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
        }
        .product-card-theme:hover {
          transform: scale(1.05);
          box-shadow: 0 7px 18px rgba(112,168,77,0.2);
        }
        .btn-green {
          background-color: rgb(112,168,77);
          color: #fff !important;
          border: none;
          border-radius: 25px;
          padding: 5px 15px;
          font-weight: 600;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .btn-green:disabled, .btn-green[disabled] {
          background-color: #ddd !important;
          color: #888 !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
        }
        .btn-green:hover {
          background-color: #95b25a;
          text-decoration: none;
        }
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
        .text-truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
              /* === Variant Section === */

            .variant-section {
          margin-bottom: 18px; /* 🟢 creates clean gap before Add to Cart */
        }

        .variant-section .variant-btn {
          margin-bottom: 6px; /* 🟢 gives each button a bit of breathing room */
        }
        .variant-section {
          border: 1px solid #e6d2b5;
          border-radius: 12px;
          background: #fffaf4;
          padding: 12px 15px;
          display: inline-block;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }

            .variant-section h6 {
              font-size: 0.95rem;
              font-weight: 700;
              color: #198754;
              letter-spacing: 0.3px;
            }

            .variant-btn {
              border: 1.5px solid #198754;
              background-color: #fff;
              color: #198754;
              font-weight: 600;
              font-size: 0.85rem;
              padding: 6px 14px;
              border-radius: 25px;
              transition: all 0.3s ease;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            }

            .variant-btn:hover {
              background-color: #198754;
              color: #fff;
              transform: translateY(-1px);
            }

            .variant-btn.active {
              background-color: #70a84d;
              border-color: #70a84d;
              color: #fff;
              box-shadow: 0 2px 6px rgba(112,168,77,0.25);
            }

            @media (max-width: 768px) {
              .variant-section {
                text-align: center;
                width: 100%;
                margin-top: 15px;
              }

              .variant-btn {
                padding: 6px 12px;
                font-size: 0.8rem;
              }
            }
              .review-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        .review-content {
          background: #fff;
          max-height: 80vh;
          overflow-y: auto;
          width: 90%;
          max-width: 500px;
          border-radius: 12px;
          animation: fadeIn 0.3s ease;
        }
        .review-list {
          max-height: 60vh;
          overflow-y: auto;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
          
        .modal-close-btn {
          position: absolute;
          top: 10px;
          right: 12px;
          background: none;
          border: none;
          font-size: 1.5rem;
          font-weight: 700;
          color: #198754;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .modal-close-btn:hover {
          transform: scale(1.1);
          color: #70a84d;
        }


        /* === Description Modal Fix === */
        .desc-modal {
          position: fixed; /* 🟢 make it overlay entire viewport */
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6); /* semi-transparent black backdrop */
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 99999; /* 🟢 ensure it's above Navbar/Footer */
        }

        .desc-modal-content {
          background: #fffaf4;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          border-radius: 12px;
          border: 1.5px solid #e6d2b5;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          position: relative;
          animation: slideUpFade 0.3s ease; /* 🟢 smooth open animation */
        }

        /* Optional subtle open animation */
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .desc-text {
          white-space: pre-line;
          font-size: 0.95rem;
          line-height: 1.6;
          color: #000000ff;
          margin-top: 10px;
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



      `}</style>

      {showDescModal && (
        <div className="desc-modal">
          <div className="desc-modal-content p-4 rounded shadow">
            <button
              className="modal-close-btn"
              onClick={() => setShowDescModal(false)}
            >
              ×
            </button>

            <h5 className="text-success fw-bold mb-3">Product Description</h5>
            <div
              className="desc-text"
              style={{
                whiteSpace: "pre-line",
                color: "#000000ff",
                fontSize: "0.95rem",
                lineHeight: "1.5rem",
              }}
            >
              {product.product_description}
            </div>

            <div className="modal-footer justify-content-center">
              <button
                className="btn-themed"
                onClick={() => setShowDescModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="review-modal">
          <div className="review-content p-4 rounded shadow">
            <h5 className="text-success fw-bold mb-3">Product Reviews</h5>

            {loadingReviews ? (
              <p className="text-center">Loading...</p>
            ) : reviews.length === 0 ? (
              <p className="text-center text-muted">No reviews yet.</p>
            ) : (
              <div className="review-list">
                {reviews.map((rev) => (
                  <div key={rev.id} className="review-item mb-3 pb-2 border-bottom">
                    <strong>{rev.user_name}</strong>
                    <div className="text-warning">
                      {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                    </div>
                    <p className="mb-1 text-secondary small">{rev.comment}</p>
                    <small className="text-muted">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </small>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <button
                className="btn-nav"
                disabled={page === 1}
                onClick={() => fetchReviews(feedbackProductId, page - 1)}
              >
                Prev
              </button>
              <button
                className="btn-nav"
                disabled={!hasNext}
                onClick={() => fetchReviews(feedbackProductId, page + 1)}
              >
                Next
              </button>
            </div>

            <div className="modal-footer justify-content-center">
              <button
                className="btn-themed"
                onClick={() => setShowReviewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


    </>
  );
};

export default Product;
