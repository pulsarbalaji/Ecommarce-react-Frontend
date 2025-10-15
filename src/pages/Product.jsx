import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Link, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
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

  const dispatch = useDispatch();
  const addProduct = (product) => {
  dispatch(addCart(product));
  toast.success("Added to cart"); // ✅ show toast
};


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

    return (
      <div className="container my-5 py-2">
        <div className="row align-items-center">
          <div className="col-md-6 col-sm-12 py-3 text-center">
            <div className="product-image-wrapper shadow-sm rounded bg-light p-3">
              <img
                className="img-fluid"
                src={`${process.env.REACT_APP_API_URL}${product.product_image}`}
                alt={product.product_name}
                style={{ objectFit: "contain", maxHeight: "350px" }}
              />
            </div>
          </div>
          <div className="col-md-6 py-3">
            <h6 className="text-uppercase text-muted">{product.category_name}</h6>
            <h3 className="fw-bold" style={{ color: "#5b3b25" }}>
              {product.product_name}
            </h3>
            <p className="lead" style={{ color: "#7a563a" }}>
              Rating: {product.average_rating} <i className="fa fa-star text-warning"></i>
            </p>

            <h4 className="text-success my-2">
              {hasOffer ? (
                <>
                  ₹{parseFloat(product.offer_price).toLocaleString()}{" "}
                  <small style={{ color: "#dc3545", textDecoration: "line-through", fontWeight: "normal" }}>
                    ₹{parseFloat(product.price).toLocaleString()}
                  </small>
                </>
              ) : (
                `₹${parseFloat(product.price).toLocaleString()}`
              )}
            </h4>

            <p className="text-muted small" style={{ minHeight: "70px" }}>
              {product.product_description}
            </p>
            <div className="d-flex flex-wrap">
              <button className="btn-themed-outline me-2 mb-2" onClick={() => addProduct(product)}>
                Add to Cart
              </button>
              <Link to="/cart" className="btn-themed mb-2">
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
      <h4 className="mb-3" style={{ color: "#7a563a", fontWeight: 600 }}>
        You may also like
      </h4>
      <div className="scroll-container">
        {similarProducts.map((item) => {
          const hasOffer = item.offer_price !== null && Number(item.offer_price) > 0 && item.offer_price !== item.price;
          return (
            <div
              key={item.id}
              className="card text-center border-0 shadow-sm rounded product-card-theme"
              style={{ position: "relative" }}
            >
              {hasOffer && (
                <div className="offer-ribbon">
                  {Math.round(item.offer_percentage)}% OFF
                </div>
              )}
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
                <h6 className="card-title text-dark small text-truncate">
                  {item.product_name.length > 18 ? item.product_name.substring(0, 18) + "..." : item.product_name}
                </h6>
                <p className="text-success small">
                  {hasOffer ? (
                    <>
                      ₹{parseFloat(item.offer_price).toLocaleString()}{" "}
                      <small style={{ color: "#dc3545", textDecoration: "line-through", fontWeight: "normal", marginLeft: "6px" }}>
                        ₹{parseFloat(item.price).toLocaleString()}
                      </small>
                    </>
                  ) : (
                    `₹${parseFloat(item.price).toLocaleString()}`
                  )}
                </p>
                <div className="d-flex justify-content-center flex-wrap">
                  <Link to={`/product/${item.id}`} className="btn-themed-outline btn-sm me-2 mb-2">
                    View
                  </Link>
                  <button className="btn-themed btn-sm mb-2" onClick={() => addProduct(item)}>
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
        .scroll-container {
          display: flex;
          overflow-x: auto;
          gap: 15px;
          padding-bottom: 12px;
          scrollbar-width: thin;
          scrollbar-color: #7a563a #f1e6d4;
        }
        .scroll-container::-webkit-scrollbar {
          height: 8px;
        }
        .scroll-container::-webkit-scrollbar-track {
          background: #f1e6d4;
          border-radius: 10px;
        }
        .scroll-container::-webkit-scrollbar-thumb {
          background: #7a563a;
          border-radius: 10px;
        }
        .product-card-theme {
          flex: 0 0 160px;
          transition: transform 0.2s ease;
          background: #fff;
          border-radius: 12px;
          border: 1px solid #f1e6d4;
          box-shadow: 0 2px 7px rgba(122, 86, 58, 0.1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }
        .product-card-theme:hover {
          transform: scale(1.05);
          box-shadow: 0 7px 18px rgba(122, 86, 58, 0.2);
        }
.offer-ribbon {
  position: absolute;
  top: 10px;
  right: 0px;
  background: linear-gradient(135deg, #ff4b2b, #ff416c);
  color: #fff;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.15);
  z-index: 5;
}




        /* Buttons */
        .btn-themed {
          background-color: #7a563a;
          color: #fff !important;
          border: none;
          border-radius: 25px;
          padding: 5px 15px;
          font-weight: 600;
          text-align: center;
          cursor: pointer;
          transition: background-color 0.3s ease;
          display: inline-block;
          user-select: none;
        }
        .btn-themed:hover {
          background-color: #68492f;
          text-decoration: none;
        }

        .btn-themed-outline {
          background-color: transparent;
          color: #7a563a !important;
          border: 1.5px solid #7a563a;
          border-radius: 25px;
          padding: 4px 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-block;
          user-select: none;
          text-align: center;
        }
        .btn-themed-outline:hover {
          background-color: #7a563a;
          color: #fff !important;
          text-decoration: none;
        }
        .text-truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </>
  );
};

export default Product;
