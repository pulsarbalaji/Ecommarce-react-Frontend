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
        // Fetch single product
        const res = await api.get(`/productlist/${id}/`);
        const data = res.data?.data;
        setProduct(data);
        setLoading(false);

        // Fetch similar products by category id
        if (data?.category) {
          const resSimilar = await api.get(`/productfilter/${data.category}/?page=1`);
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

  const LoadingProduct = () => (
    <div className="container my-5 py-2">
      <div className="row">
        <div className="col-md-6 py-3">
          <Skeleton height={400} width={400} />
        </div>
        <div className="col-md-6 py-5">
          <Skeleton height={30} width={250} />
          <Skeleton height={90} />
          <Skeleton height={40} width={70} />
          <Skeleton height={50} width={110} />
          <Skeleton height={120} />
          <Skeleton height={40} width={110} inline={true} />
          <Skeleton className="mx-3" height={40} width={110} />
        </div>
      </div>
    </div>
  );

  const ShowProduct = () => (
    <div className="container my-5 py-2">
      <div className="row align-items-center">
        <div className="col-md-6 col-sm-12 py-3 text-center">
          <div className="product-image-wrapper shadow-sm rounded bg-light p-3">
            <img
              className="img-fluid"
              src={`http://127.0.0.1:8000${product?.product_image}`}
              alt={product?.product_name}
              style={{ objectFit: "contain", maxHeight: "400px" }}
            />
          </div>
        </div>
        <div className="col-md-6 py-3">
          <h6 className="text-uppercase text-muted">{product?.category_name}</h6>
          <h2 className="fw-bold">{product?.product_name}</h2>
          <p className="lead">
            Rating: {product?.average_rating}{" "}
            <i className="fa fa-star text-warning"></i>
          </p>
          <h3 className="text-success my-3">₹{product?.price}</h3>
          <p className="text-muted">{product?.product_description}</p>
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

  const LoadingSimilar = () => (
    <div className="grid-container my-4 py-4">
      {[...Array(5)].map((_, idx) => (
        <div key={idx}>
          <Skeleton height={250} />
        </div>
      ))}
    </div>
  );

  const ShowSimilarProducts = () => (
    <div className="my-5">
      <h3 className="mb-4">You may also like</h3>
      <div className="grid-container">
        {similarProducts.map((item) => (
          <div
            key={item.id}
            className="card text-center h-100 border-0 shadow-sm rounded hover-scale"
          >
            <div className="p-3 bg-light rounded">
              <img
                className="card-img-top"
                src={`http://127.0.0.1:8000${item.product_image}`}
                alt={item.product_name}
                height={180}
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className="card-body">
              <h6 className="card-title text-dark">
                {item.product_name.substring(0, 20)}...
              </h6>
              <p className="text-success">₹{item.price}</p>
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
                  Add to Cart
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
        .grid-container {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }
        @media (max-width: 1200px) { .grid-container { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 992px) { .grid-container { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) { .grid-container { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 576px) { .grid-container { grid-template-columns: repeat(1, 1fr); } }
        .hover-scale:hover {
          transform: scale(1.03);
          transition: all 0.3s ease-in-out;
        }
        .card img {
          object-fit: contain;
        }
      `}</style>
    </>
  );
};

export default Product;
