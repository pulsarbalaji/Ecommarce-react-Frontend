import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Link, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";

import { Footer, Navbar } from "../components";
import api from "../utils/base_url";

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  const dispatch = useDispatch();
  const addProduct = (product) => dispatch(addCart(product));

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setLoadingSimilar(true);

      try {
        const res = await api.get(`/productlist/${id}/`);
        const data = res.data?.data;
        setProduct(data);
        setLoading(false);

        if (data?.category) {
          const resSimilar = await api.get(
            `/productfilter/${data.category}/?page=1`
          );
          const dataSimilar = resSimilar.data?.data || [];
          setSimilarProducts(dataSimilar.filter((item) => item.id !== data.id));
        }
        setLoadingSimilar(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
        setLoadingSimilar(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Skeleton loader for main product
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

  // Show main product
  const ShowProduct = () => (
    <div className="container my-5 py-2">
      <div className="row align-items-center">
        <div className="col-md-6 col-sm-12 py-3 text-center">
          <div className="product-image-wrapper shadow-sm rounded bg-light p-3">
            <img
              className="img-fluid"
              src={`${process.env.REACT_APP_API_URL}${product?.product_image}`}
              alt={product?.product_name}
              style={{ objectFit: "contain", maxHeight: "350px" }}
            />
          </div>
        </div>
        <div className="col-md-6 py-3">
          <h6 className="text-uppercase text-muted">
            {product?.category_name}
          </h6>
          <h3 className="fw-bold">{product?.product_name}</h3>
          <p className="lead">
            Rating: {product?.average_rating}{" "}
            <i className="fa fa-star text-warning"></i>
          </p>
          <h4 className="text-success my-2">₹{product?.price}</h4>
          <p className="text-muted small">{product?.product_description}</p>
          <div className="d-flex flex-wrap">
            <button
              className="btn btn-outline-dark me-2 mb-2"
              onClick={() => addProduct(product)}
            >
              Add to Cart
            </button>
            <Link to="/cart" className="btn btn-dark mb-2">
              Go to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // Skeleton loader for similar products
  const LoadingSimilar = () => (
    <div className="scroll-container my-4 py-3">
      {[...Array(5)].map((_, idx) => (
        <div key={idx} className="card skeleton-card">
          <Skeleton height={180} width={140} />
        </div>
      ))}
    </div>
  );

  // Show similar products (horizontal scroll)
  const ShowSimilarProducts = () => (
    <div className="my-5 container">
      <h4 className="mb-3">You may also like</h4>
      <div className="scroll-container">
        {similarProducts.map((item) => (
          <div
            key={item.id}
            className="card text-center border-0 shadow-sm rounded product-card"
          >
            <div className="p-2 bg-light rounded">
              <img
                className="card-img-top"
                src={`${process.env.REACT_APP_API_URL}${item.product_image}`}
                alt={item.product_name}
                height={120}
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className="card-body p-2">
              <h6 className="card-title text-dark small">
                {item.product_name.substring(0, 18)}...
              </h6>
              <p className="text-success small">₹{item.price}</p>
              <div className="d-flex justify-content-center flex-wrap">
                <Link
                  to={`/product/${item.id}`}
                  className="btn btn-outline-dark btn-sm me-2 mb-2"
                >
                  View
                </Link>
                <button
                  className="btn btn-dark btn-sm mb-2"
                  onClick={() => addProduct(item)}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div style={{ backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
        {loading || !product ? <LoadingProduct /> : <ShowProduct />}
        {loadingSimilar ? <LoadingSimilar /> : <ShowSimilarProducts />}
      </div>
      <Footer />

      <style>{`
        /* Horizontal scroll container */
        .scroll-container {
          display: flex;
          overflow-x: auto;
          gap: 15px;
          padding-bottom: 10px;
          scrollbar-width: thin;
        }
        .scroll-container::-webkit-scrollbar {
          height: 6px;
        }
        .scroll-container::-webkit-scrollbar-thumb {
          background: #aaa;
          border-radius: 4px;
        }
        .product-card {
          flex: 0 0 160px;
          transition: transform 0.2s ease;
        }
        .product-card:hover {
          transform: scale(1.05);
        }
        .skeleton-card {
          flex: 0 0 160px;
        }
      `}</style>
    </>
  );
};

export default Product;
