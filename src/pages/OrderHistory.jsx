// OrderHistory.jsx
import React, { useState, useEffect,useCallback  } from "react";
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
    [user] // re-create only if user changes
  );

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);


  const Loading = () => (
    <div className="grid-container">
      {[...Array(6)].map((_, idx) => (
        <div key={idx} className="card p-3 shadow-sm">
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
        {orders.map((order, idx) => (
          <div key={idx} className="card shadow-sm h-100 text-center p-3">
            <h5 className="mb-2">Order #{order.order_number}</h5>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`badge ${
                  order.status === "delivered"
                    ? "bg-success"
                    : order.status === "pending"
                    ? "bg-warning text-dark"
                    : "bg-secondary"
                }`}
              >
                {order.status}
              </span>
            </p>
            <p className="lead mb-2">Total: ₹{order.total_amount}</p>
            <div className="mt-auto">
              <Link
                to={`/order-tracking/${order.order_number}`}
                className="btn btn-dark btn-sm"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-4">
        <button
          className="btn btn-outline-dark m-1"
          disabled={page === 1}
          onClick={() => fetchOrders(page - 1)}
        >
          Prev
        </button>
        <span className="btn btn-light m-1 disabled">
          Page {page} of {totalPages}
        </span>
        <button
          className="btn btn-outline-dark m-1"
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
        <h2 className="display-5 text-center">My Order History</h2>
        <hr />
        {loading ? <Loading /> : <ShowOrders />}
      </div>
      <Footer />

      {/* Same Grid CSS as Products */}
      <style>
        {`
          .grid-container {
            display: grid;
            grid-template-columns: repeat(4, 1fr); 
            gap: 20px;
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
    </>
  );
};

export default OrderHistory;
