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
        console.log(res.data.data ,"Test");
        
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
        <h5>Loading order details...</h5>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5 text-center">
        <h5>No order found</h5>
        <Link to="/" className="btn btn-outline-dark mt-3">
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
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-light">
            <h4 className="mb-0">Order Tracking</h4>
          </div>
          <div className="card-body">
            <h5>Order #{order.order_number}</h5>
            <p className="mb-1">
              <strong>Status:</strong>{" "}
              <span className="badge bg-success text-uppercase">
                {order.status}
              </span>
            </p>
            <p className="mb-1">
              <strong>Ordered At:</strong>{" "}
              {new Date(order.ordered_at).toLocaleString()}
            </p>
            {order.delivered_at && (
              <p>
                <strong>Delivered At:</strong>{" "}
                {new Date(order.delivered_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="row">
          {/* Left side: Addresses & Payment */}
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-light">
                <h5 className="mb-0">Addresses</h5>
              </div>
              <div className="card-body">
                <p>
                  <strong>Billing Address:</strong>
                  <br />
                  {order.billing_address}
                </p>
                <p>
                  <strong>Shipping Address:</strong>
                  <br />
                  {order.shipping_address}
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-light">
                <h5 className="mb-0">Payment</h5>
              </div>
              <div className="card-body">
                <p>
                  <strong>Payment Method:</strong> {order.payment_method}
                </p>
                <p>
                  <strong>Payment Status:</strong>{" "}
                  <span
                    className={`badge ${
                      order.payment_status === "success"
                        ? "bg-success"
                        : "bg-danger"
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </p>
                {order.payment && (
                  <>
                    <p>
                      <strong>Payment ID:</strong> {order.payment.payment_id}
                    </p>
                    <p>
                      <strong>Order ID:</strong> {order.payment.order_id}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-light">
            <h5 className="mb-0">Items</h5>
          </div>
          <div className="card-body table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
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
                    <td>₹{item.price}</td>
                    <td>₹{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-light">
            <h5 className="mb-0">Order Summary</h5>
          </div>
          <div className="card-body">
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex justify-content-between">
                Subtotal <span>₹{order.subtotal}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                Tax <span>₹{order.tax}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                Shipping <span>₹{order.shipping_cost}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <strong>Total</strong> <strong>₹{order.total_amount}</strong>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Link to="/" className="btn btn-outline-dark">
            Back to Home
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderTracking;
