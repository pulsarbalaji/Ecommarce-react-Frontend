import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Navbar, Footer } from "../components";
import { useAuth } from "../context/AuthContext";
import api from "../utils/base_url";

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(
    async (pageNo = 1) => {
      if (!user?.customer_details?.id) return;
      setLoading(true);
      try {
        const res = await api.get(
          `orders-history/${user.customer_details.id}/?page=${pageNo}`
        );
        const result = res.data.results || [];
        setOrders(result);
        setPage(pageNo);
        setTotalPages(Math.ceil(res.data.count / 16));
      } catch (error) {
        console.error("Error fetching order history:", error);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const statusClasses = {
    pending: "bg-warning text-dark",
    order_confirmed: "bg-info text-dark",
    shipped: "bg-primary",
    delivered: "bg-success",
    cancelled: "bg-danger",
    returned: "bg-secondary",
  };

  const formatStatus = (status) => {
    if (!status) return "";
    return status
      .replace(/_/g, " ")       // replace underscores with spaces
      .replace(/\b\w/g, (c) => c.toUpperCase());  // capitalize each word
  };


  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const Loading = () => (
    <div className="grid-container">
      {[...Array(6)].map((_, idx) => (
        <div key={idx} className="card p-3 shadow-sm rounded-theme placeholder-card">
          <div className="placeholder-glow">
            <span className="placeholder col-6"></span>
          </div>
          <div className="placeholder-glow mt-2">
            <span className="placeholder col-4"></span>
          </div>
          <div className="placeholder-glow mt-2">
            <span className="placeholder col-8"></span>
          </div>
        </div>
      ))}
    </div>
  );

  const ShowOrders = () => (
    <>
      <div className="grid-container">
        {orders.map((order, idx) => {
          const firstItem = order.items?.[0];
          const imageUrl = firstItem?.product_image
            ? `${process.env.REACT_APP_API_URL}${firstItem.product_image}`
            : "/no-image.png";

          return (
            <div key={idx} className="card shadow-sm text-center p-3 rounded-theme">
              <div className="image-container mb-3">
                <img
                  src={imageUrl}
                  alt={firstItem?.product_name || "Product"}
                  className="img-fluid product-image"
                />
              </div>
              <h6 className="mb-1 text-theme-dark fw-bold">
                {firstItem?.product_name
                  ? ` ${firstItem.product_name}`
                  : "Products included"}
              </h6>

              <p className="small mb-1">
                <strong>Status:</strong>{" "}
                <span className={`badge ${statusClasses[order.status] || "bg-secondary"}`}>
                  {formatStatus(order.status)}
                </span>
              </p>


              <p className="text-theme-medium small mb-2">
                Order #{order.order_number}
              </p>

              <p className="fw-bold text-theme-dark mb-3">
                ₹{order.total_amount.toLocaleString()}
              </p>

              <Link to={`/order-tracking/${order.order_number}`}>
                <button type="button" className="btn-themed w-100">
                  View Details
                </button>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-5">
        <button
          className="btn-nav"
          disabled={page === 1}
          onClick={() => fetchOrders(page - 1)}
        >
          Prev
        </button>
        <button
          className="btn-nav"
          disabled={page === totalPages}
          onClick={() => fetchOrders(page + 1)}
        >
          Next
        </button>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h2 className="display-6 text-center text-theme-dark">My Order History</h2>
        <hr />
        {loading ? <Loading /> : <ShowOrders />}
      </div>
      <Footer />

      <style>{`
        :root {
          --green-dark: rgb(112,168,77);
          --green-darker: #198754;
          --green-light: #ffffffff;
          --cream-bg: #fffaf4;
          --text-dark: #000000ff;
          --text-medium: #000000ff;
        }

        body, html, .container {
          background-color: var(--cream-bg);
        }

        /* === GRID LAYOUT === */
        .grid-container {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }

        @media (max-width: 1200px) {
          .grid-container { grid-template-columns: repeat(4, 1fr); }
        }

        @media (max-width: 992px) {
          .grid-container { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 768px) {
          .grid-container { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 480px) {
          .grid-container { grid-template-columns: repeat(2, 1fr); }
        }

        .card {
          background-color: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .card:hover {
          transform: scale(1.03);
          box-shadow: 0 6px 15px rgba(112,168,77,0.25);
        }

        .image-container {
          width: 100%;
          height: 130px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--green-light);
          border-radius: 10px;
          overflow: hidden;
        }

        .product-image {
          max-height: 100%;
          width: auto;
          object-fit: contain;
        }

        /* === BUTTONS === */
        .btn-nav {
          border: none;
          background: var(--green-dark);
          color: #fff;
          padding: 6px 14px;
          border-radius: 25px;
          margin: 0 4px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .btn-nav:hover {
          background: var(--green-darker);
        }

        .btn-themed {
          background-color: var(--green-dark);
          color: #fff !important;
          border-radius: 25px;
          font-weight: 600;
          padding: 6px 12px;
          border: none;
          transition: background-color 0.3s ease;
          cursor: pointer;
        }

        .btn-themed:hover {
          background-color: var(--green-darker);
        }

        .rounded-theme {
          border-radius: 12px !important;
        }

        .text-theme-dark {
          color: var(--text-dark);
        }

        .text-theme-medium {
          color: var(--text-medium);
        }
      `}</style>
    </>
  );
};

export default OrderHistory;
