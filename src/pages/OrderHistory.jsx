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
        {orders.map((order, idx) => (
          <div key={idx} className="card shadow-sm h-100 text-center p-3 rounded-theme">
            <h5 className="mb-2 text-theme-dark">Order #{order.order_number}</h5>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`badge ${order.status === "delivered"
                    ? "bg-success"
                    : order.status === "pending"
                      ? "bg-warning text-dark"
                      : "bg-secondary"
                  }`}
              >
                {order.status}
              </span>
            </p>
            <p className="lead mb-2 text-theme-medium">Total: ₹{order.total_amount.toLocaleString()}</p>
            <div className="mt-auto">
              <Link
                to={`/order-tracking/${order.order_number}`}>
                <button type="button" className="btn-themed">
                  View Details
                </button>
              </Link>

            </div>
          </div>
        ))}
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
        {/* <span className="btn btn-light m-1 disabled text-theme-dark">
          Page {page} of {totalPages}
        </span> */}
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
        <h2 className="display-5 text-center text-theme-dark">My Order History</h2>
        <hr />
        {loading ? <Loading /> : <ShowOrders />}
      </div>
      <Footer />

      <style>{`
        :root {
          --brown-dark: rgb(112,168,77);
          --brown-darker: #198754;
          --brown-light: #f1e6d4;
          --cream-bg: #fffaf4;
          --text-dark: #000000ff;
          --text-medium: #000000ff;
        }

        body, html, .container {
          background-color: var(--cream-bg);
        }

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

        .btn-nav {
  border: none;
  background: rgb(112,168,77);
  color: #fff;
  padding: 6px 14px;
  border-radius: 25px;
  margin: 0 4px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-nav:hover {
  background: #198754;
}

        @media (max-width: 576px) {
          .grid-container {
            grid-template-columns: 1fr;
          }
        }

        .rounded-theme {
          border-radius: 12px !important;
        }

        .shadow-sm {
          box-shadow: 0 4px 8px rgba(122, 86, 58, 0.1) !important;
        }

        .text-theme-dark {
          color: var(--text-dark);
        }

        .text-theme-medium {
          color: var(--text-medium);
        }

        .btn-themed {
          background-color: var(--brown-dark);
          color: #fff !important;
          border-radius: 25px;
          font-weight: 600;
          padding: 5px 15px;
          border: none;
          transition: background-color 0.3s ease;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(122, 86, 58, 0.15);
          display: inline-block;
          font-size: 0.875rem;
        }

        .btn-themed:hover,
        .btn-themed:focus {
          background-color: var(--brown-darker);
          outline: none;
          text-decoration: none;
          box-shadow: 0 0 8px rgba(122, 86, 58, 0.4);
        }

        .btn-outline-themed {
          color: var(--brown-dark);
          border-color: var(--brown-dark);
          border-width: 2px;
          border-radius: 25px;
          font-weight: 600;
          padding: 5px 15px;
          transition: all 0.3s ease;
          background-color: transparent;
        }

        .btn-outline-themed:hover {
          background-color: var(--brown-dark);
          color: white;
          border-color: var(--brown-dark);
          text-decoration: none;
        }

        .placeholder-card {
          background-color: var(--cream-bg);
          border-radius: 12px;
        }

        .placeholder {
          border-radius: 5px;
          background: linear-gradient(90deg, #f1e6d4 25%, #e8d0b9 37%, #f1e6d4 63%);
          animation: placeholderShimmer 1.4s infinite linear;
        }

        @keyframes placeholderShimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: 200px 0;
          }
        }
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

/* Change here - show 2 columns on smaller mobile screens */
@media (max-width: 576px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}


      `}</style>
    </>
  );
};

export default OrderHistory;
