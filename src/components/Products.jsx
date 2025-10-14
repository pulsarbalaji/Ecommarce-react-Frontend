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

  const { user } = useAuth();
  const navigate = useNavigate();

  // pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const dispatch = useDispatch();

  const addProduct = (product) => {
    if (user) {
      dispatch(addCart(product));
      toast.success("Added to cart");
    } else {
      toast.error("Please login first!");
      navigate("/login");
    }
  };

  // fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get("categorylist/");
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // fetch products
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
        {categories.map((cat) => (
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
      </div>

      {/* Product Grid */}
      <div className="grid-container">
        {products.map((product) => (
          <div key={product.id} className="product-card shadow-sm">
            <div className="img-wrapper">
              <img
                src={`${process.env.REACT_APP_API_URL}${product.product_image}`}
                alt={product.product_name}
              />
            </div>
            <div className="product-content">
              <h5 className="product-title">
                {product.product_name.substring(0, 15)}...
              </h5>
              <p className="product-desc">
                {product.product_description.substring(0, 70)}...
              </p>
              <p className="product-price">₹ {product.price}</p>
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
        ))}
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-5">
        <button
          className="btn-nav"
          disabled={page === 1}
          onClick={() =>
            fetchProducts(page - 1, selectedCat ? selectedCat : null)
          }
        >
          ‹ Prev
        </button>
        <span className="page-indicator">
          Page {page} of {totalPages}
        </span>
        <button
          className="btn-nav"
          disabled={page === totalPages}
          onClick={() =>
            fetchProducts(page + 1, selectedCat ? selectedCat : null)
          }
        >
          Next ›
        </button>
      </div>

      {/* Styles */}
      <style>{`
/* Grid Layout */
.grid-container {
  display: grid;
  gap: 18px;
  padding: 0 10px;
  grid-template-columns: repeat(2, 1fr);
}

/* Tablet View (≥768px) */
@media (min-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Desktop (≥1024px) */
@media (min-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Large Desktop (≥1400px) */
@media (min-width: 1400px) {
  .grid-container {
    grid-template-columns: repeat(6, 1fr);
  }
}

/* Product Card */
.product-card {
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

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 5px 14px rgba(122, 86, 58, 0.15);
}

/* Image Section */
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

.product-card:hover img {
  transform: scale(1.05);
}

/* Text Section */
.product-content {
  text-align: center;
  padding: 10px 12px;
  flex-grow: 1;
}

.product-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: #5b3b25;
  margin-bottom: 4px;
}

.product-desc {
  color: #777;
  font-size: 0.85rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;      /* Limit to 2 lines */
  -webkit-box-orient: vertical;
  min-height: unset;
  max-height: unset;
}

.product-price {
  font-size: 1rem;
  color: #7a563a;
  font-weight: bold;
  margin-top: 6px;
}

/* Buttons */
.btn-buy, .btn-cart {
  border: none;
  border-radius: 25px;
  padding: 5px 12px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-buy {
  background-color: #7a563a;
  color: #fff;
}

.btn-buy:hover {
  background-color: #68492f;
}

.btn-cart {
  background-color: #f1e6d4;
  color: #7a563a;
}

.btn-cart:hover {
  background-color: #e8d5b9;
}

/* Category Filter Buttons */
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

.btn-nav:hover {
  background: #68492f;
}

.page-indicator {
  padding: 6px 14px;
  font-weight: 500;
  color: #7a563a;
}

/* Mobile Button Size and Description Adjustment */
@media (max-width: 767px) {
  .btn-buy, .btn-cart, .cat-btn, .btn-nav {
    padding: 4px 8px;
    font-size: 0.75rem;
  }

  /* Ensure the description stays limited to 2 lines on mobile */
  .product-desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
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
