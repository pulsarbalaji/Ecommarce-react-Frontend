import React, { useEffect, useState } from "react";
import { Footer, Navbar } from "../components";
import { useParams, Link } from "react-router-dom";
import api from "../utils/base_url";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`orderdetails/${orderId}/`);
        setOrder(res.data.data);
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <h4 style={{ color: "#198754" }}>Loading order details...</h4>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5 text-center">
        <h4 style={{ color: "#198754" }}>Order not found!</h4>
        <Link to="/" className="btn btn-outline-themed mt-3">
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card rounded-theme shadow-theme">
              <div className="card-header text-white text-center rounded-top-theme" style={{ backgroundColor: "#198754", color: "#fff" }}>

                <h4>Order Confirmed!</h4>
              </div>
              <div className="card-body">
                <h5 className="card-title mb-3 text-center text-theme-dark">
                  Thank you, <strong>{order.customer_name}</strong>
                </h5>

                <p className="text-center text-theme-medium">
                  Your order <strong>#{order.order_number}</strong> has been placed successfully.
                </p>

                <div className="row mb-4 text-theme-dark">
                  <div className="col-12 col-md-6 mb-3 mb-md-0">
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Payment Method:</strong> {order.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
                    <p><strong>Payment Status:</strong> {order.payment_status}</p>
                    <p><strong>preferred Courier:</strong> {order.preferred_courier_service}</p>
                  </div>
                  <div className="col-12 col-md-6">
                    <p><strong>Shipping Address:</strong> {order.shipping_address}</p>
                    <p><strong>Billing Address:</strong> {order.billing_address}</p>
                    <p><strong>Ordered At:</strong> {new Date(order.ordered_at).toLocaleString()}</p>
                  </div>
                </div>

                <h5 className="mb-3 text-theme-dark">Order Items</h5>
                <div className="table-responsive">
                  <table className="table table-bordered rounded-theme mb-0">
                    <thead className="table-light text-theme-dark">
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
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

                <div className="text-end mt-4 text-theme-dark">
                  <p><strong>Subtotal:</strong> ₹{order.subtotal.toLocaleString()}</p>
                  <p><strong>Tax:</strong> ₹{order.tax.toLocaleString()}</p>
                  <p><strong>Shipping:</strong> ₹{order.shipping_cost.toLocaleString()}</p>
                  <h5><strong>Total Amount:</strong> ₹{order.total_amount.toLocaleString()}</h5>
                </div>

                <div className="text-center mt-4">
                  <Link to="/">
                    <button type="button" className="btn-themed">
                      Continue Shopping
                    </button>
                  </Link>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      <style>{`
        :root {
          --brown-dark: #198754;
          --brown-darker:  rgb(112,168,77);
          --brown-light: #f1e6d4;
          --cream-bg: #fffaf4;
          --text-dark: #000000ff;
          --text-medium: #000000ff;
          --text-muted:  rgb(112,168,77);
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

        /* Responsive improvements */
        @media (max-width: 767px) {
          .col-md-6 {
            margin-bottom: 1rem;
          }
          .table-responsive {
            margin-bottom: 1rem;
          }
          .card-header h4 {
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

export default OrderConfirmation;
