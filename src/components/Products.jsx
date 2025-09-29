// Products.jsx
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
        <div key={idx}>
          <Skeleton height={250} />
        </div>
      ))}
    </div>
  );

  const ShowProducts = () => (
    <>
      {/* Category Buttons */}
      <div className="buttons text-center py-4">
        <button
          className={`btn btn-outline-dark btn-sm m-1 ${
            selectedCat === null ? "active" : ""
          }`}
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
            className={`btn btn-outline-dark btn-sm m-1 ${
              selectedCat === cat.id ? "active" : ""
            }`}
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
          <div key={product.id} className="card text-center h-100">
            <img
              className="card-img-top p-3"
              src={`http://127.0.0.1:8000${product.product_image}`}
              alt={product.product_name}
              style={{ height: "180px", objectFit: "contain" }}
            />
            <div className="card-body">
              <h5 className="card-title">
                {product.product_name.substring(0, 15)}...
              </h5>
              <p className="card-text">
                {product.product_description.substring(0, 70)}...
              </p>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item lead">₹ {product.price}</li>
            </ul>
            <div className="card-body">
              <Link to={`/product/${product.id}`} className="btn btn-dark m-1">
                Buy Now
              </Link>
              <button
                className="btn btn-dark m-1"
                onClick={() => addProduct(product)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-4">
        <button
          className="btn btn-outline-dark m-1"
          disabled={page === 1}
          onClick={() =>
            fetchProducts(page - 1, selectedCat ? selectedCat : null)
          }
        >
          Prev
        </button>
        <span className="btn btn-light m-1 disabled">
          Page {page} of {totalPages}
        </span>
        <button
          className="btn btn-outline-dark m-1"
          disabled={page === totalPages}
          onClick={() =>
            fetchProducts(page + 1, selectedCat ? selectedCat : null)
          }
        >
          Next
        </button>
      </div>
    </>
  );

  return (
    <div className="container my-3 py-3">
      <h2 className="display-5 text-center">Latest Products</h2>
      <hr />
      {loading ? <Loading /> : <ShowProducts />}

      {/* CSS Grid */}
      {/* CSS Grid */}
      <style>
        {`
    .grid-container {
      display: grid;
      grid-template-columns: repeat(5, 1fr); /* 5 items per row */
      gap: 20px;
    }

    @media (max-width: 1400px) {
      .grid-container {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    @media (max-width: 1200px) {
      .grid-container {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 768px) {
      .grid-container {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 576px) {
      .grid-container {
        grid-template-columns: repeat(1, 1fr);
      }
    }
  `}
      </style>
    </div>
  );
};

export default Products;
