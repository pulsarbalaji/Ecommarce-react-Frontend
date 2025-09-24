import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Products = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const addProduct = (product) => {
    dispatch(addCart(product));
  };

  useEffect(() => {
    let componentMounted = true;
    const getProducts = async () => {
      setLoading(true);
      const response = await fetch("https://fakestoreapi.com/products/");
      if (componentMounted) {
        const products = await response.json();
        setData(products);
        setFilter(products);
        setLoading(false);
      }
    };
    getProducts();

    return () => {
      componentMounted = false;
    };
  }, []);

  const Loading = () => (
    <div className="grid-container">
      {[...Array(10)].map((_, idx) => (
        <div key={idx}>
          <Skeleton height={250} />
        </div>
      ))}
    </div>
  );

  const filterProduct = (cat) => {
    const updatedList = data.filter((item) => item.category === cat);
    setFilter(updatedList);
  };

  const ShowProducts = () => (
    <>
      <div className="buttons text-center py-4">
        <button className="btn btn-outline-dark btn-sm m-1" onClick={() => setFilter(data)}>All</button>
        <button className="btn btn-outline-dark btn-sm m-1" onClick={() => filterProduct("men's clothing")}>Men's Clothing</button>
        <button className="btn btn-outline-dark btn-sm m-1" onClick={() => filterProduct("women's clothing")}>Women's Clothing</button>
        <button className="btn btn-outline-dark btn-sm m-1" onClick={() => filterProduct("jewelery")}>Jewelery</button>
        <button className="btn btn-outline-dark btn-sm m-1" onClick={() => filterProduct("electronics")}>Electronics</button>
      </div>

      <div className="grid-container">
        {filter.map((product) => (
          <div key={product.id} className="card text-center h-100">
            <img
              className="card-img-top p-3"
              src={product.image}
              alt={product.title}
              style={{ height: "180px", objectFit: "contain" }}
            />
            <div className="card-body">
              <h5 className="card-title">{product.title.substring(0, 15)}...</h5>
              <p className="card-text">{product.description.substring(0, 70)}...</p>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item lead">$ {product.price}</li>
            </ul>
            <div className="card-body">
              <Link to={"/product/" + product.id} className="btn btn-dark m-1">Buy Now</Link>
              <button
                className="btn btn-dark m-1"
                onClick={() => {
                  toast.success("Added to cart");
                  addProduct(product);
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="container my-3 py-3">
      <h2 className="display-5 text-center">Latest Products</h2>
      <hr />
      {loading ? <Loading /> : <ShowProducts />}

      {/* CSS Grid */}
      <style>
        {`
          .grid-container {
            display: grid;
            grid-template-columns: repeat(5, 1fr); /* 5 items per row */
            gap: 20px;
          }

          @media (max-width: 1200px) {
            .grid-container {
              grid-template-columns: repeat(4, 1fr);
            }
          }

          @media (max-width: 992px) {
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
