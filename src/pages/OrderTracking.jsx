import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar, Footer } from "../components";
import api from "../utils/base_url";

const OrderTracking = () => {
  const { orderNumber } = useParams(); // e.g., /order-tracking/:orderNumber
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`order-tracking/${orderNumber}/`);
        setOrder(res.data.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <h5 style={{ color: "#5b3b25" }}>Loading order details...</h5>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5 text-center">
        <h5 style={{ color: "#5b3b25" }}>No order found</h5>
        <Link to="/" className="btn btn-outline-themed mt-3">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container py-5">
        {/* Header */}
        <div className="card mb-4 shadow-theme rounded-theme">
          <div className="card-header bg-light rounded-top-theme">
            <h4 className="mb-0 text-theme-dark text-center">Order Tracking</h4>
          </div>
          <div className="card-body">
            <h5 className="text-theme-dark">Order #{order.order_number}</h5>
            <p className="mb-1">
              <strong>Status:</strong>{" "}
              <span className={`badge ${order.status === "delivered" ? "bg-success" : "bg-warning text-dark"} text-uppercase`}>
                {order.status}
              </span>
            </p>
            <p className="mb-1 text-theme-dark">
              <strong>Ordered At:</strong> {new Date(order.ordered_at).toLocaleString()}
            </p>
            {order.delivered_at && (
              <p className="text-theme-dark">
                <strong>Delivered At:</strong> {new Date(order.delivered_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="row g-4">
          {/* Addresses */}
          <div className="col-md-6">
            <div className="card shadow-theme h-100 rounded-theme">
              <div className="card-header bg-light rounded-top-theme">
                <h5 className="mb-0 text-theme-dark">Addresses</h5>
              </div>
              <div className="card-body text-theme-dark">
                <p>
                  <strong>Billing Address:</strong><br />
                  {order.billing_address}
                </p>
                <p>
                  <strong>Shipping Address:</strong><br />
                  {order.shipping_address}
                </p>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="col-md-6">
            <div className="card shadow-theme h-100 rounded-theme">
              <div className="card-header bg-light rounded-top-theme">
                <h5 className="mb-0 text-theme-dark">Payment</h5>
              </div>
              <div className="card-body text-theme-dark">
                <p><strong>Payment Method:</strong> {order.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
                <p>
                  <strong>Payment Status:</strong>{" "}
                  <span className={`badge ${order.payment_status === "success" ? "bg-success" : "bg-danger"}`}>
                    {order.payment_status}
                  </span>
                </p>
                {order.payment && (
                  <>
                    <p><strong>Payment ID:</strong> {order.payment.payment_id}</p>
                    <p><strong>Order ID:</strong> {order.payment.order_id}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card mb-4 shadow-theme rounded-theme">
          <div className="card-header bg-light rounded-top-theme">
            <h5 className="mb-0 text-theme-dark">Items</h5>
          </div>
          <div className="card-body table-responsive">
            <table className="table table-bordered align-middle rounded-theme">
              <thead className="table-light text-theme-dark">
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price.toLocaleString()}</td>
                    <td>₹{item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="card mb-4 shadow-theme rounded-theme">
          <div className="card-header bg-light rounded-top-theme">
            <h5 className="mb-0 text-theme-dark">Order Summary</h5>
          </div>
          <div className="card-body text-theme-dark">
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex justify-content-between border-0 px-0 pb-0">
                Subtotal <span>₹{order.subtotal.toLocaleString()}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                Tax <span>₹{order.tax.toLocaleString()}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                Shipping <span>₹{order.shipping_cost.toLocaleString()}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between border-0 px-0 mb-0 fw-bold">
                Total <span>₹{order.total_amount.toLocaleString()}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Link to="/" >
              <button type="button" className="btn-themed">
                   Back to Home
                </button>
          </Link>
       
        </div>
      </div>
      <Footer />

      <style>{`
        :root {
          --brown-dark: #7a563a;
          --brown-darker: #68492f;
          --brown-light: #f1e6d4;
          --cream-bg: #fffaf4;
          --text-dark: #5b3b25;
          --text-medium: #7a563a;
        }

        body, html, .container {
          background-color: var(--cream-bg);
        }

        .rounded-theme {
          border-radius: 12px !important;
        }
        .rounded-top-theme {
          border-top-left-radius: 12px !important;
          border-top-right-radius: 12px !important;
        }

        .shadow-theme {
          box-shadow: 0 5px 14px rgba(122, 86, 58, 0.15) !important;
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
          padding: 10px 30px;
          border: none;
          font-size: 1rem;
          transition: background-color 0.3s ease;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(122, 86, 58, 0.18);
          display: inline-block;
        }

        .btn-themed:hover,
        .btn-themed:focus {
          background-color: var(--brown-darker);
          outline: none;
          text-decoration: none;
          box-shadow: 0 0 10px rgba(122, 86, 58, 0.6);
        }

        .table-bordered {
          border: 1px solid var(--brown-light);
        }

        .table-bordered th,
        .table-bordered td {
          border: 1px solid var(--brown-light);
          vertical-align: middle;
        }

        .table-light {
          background-color: var(--cream-bg);
          color: var(--text-dark);
        }

        /* Responsive */
        @media (max-width: 767px) {
          .row.mb-4 > div {
            margin-bottom: 1rem;
          }
          .table-responsive {
            margin-bottom: 1rem;
          }
          .card-header h4,
          .card-header h5 {
            font-size: 1.5rem;
          }
          .btn-themed {
            font-size: 1.1rem;
            padding: 12px 20px;
          }
        }
      `}</style>
    </>
  );
};

export default OrderTracking;
