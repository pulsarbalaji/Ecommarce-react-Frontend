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
        setOrder(res.data.data); // ✅ response contains "data"
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
        <h4>Loading order details...</h4>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5 text-center">
        <h4>Order not found!</h4>
        <Link to="/" className="btn btn-outline-dark mt-3">
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
            <div className="card shadow">
              <div className="card-header bg-success text-white text-center">
                <h4>Order Confirmed!</h4>
              </div>
              <div className="card-body">
                <h5 className="card-title mb-3 text-center">
                  Thank you, <strong>{order.customer_name}</strong>
                </h5>

                <p className="text-center">
                  Your order <strong>#{order.order_number}</strong> has been placed successfully.
                </p>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Payment Method:</strong> {order.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
                    <p><strong>Payment Status:</strong> {order.payment_status}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Shipping Address:</strong> {order.shipping_address}</p>
                    <p><strong>Billing Address:</strong> {order.billing_address}</p>
                    <p><strong>Ordered At:</strong> {new Date(order.ordered_at).toLocaleString()}</p>
                  </div>
                </div>

                <h5 className="mb-3">Order Items</h5>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.product_name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.price}</td>
                        <td>₹{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="text-end mt-4">
                  <p><strong>Subtotal:</strong> ₹{order.subtotal}</p>
                  <p><strong>Tax:</strong> ₹{order.tax}</p>
                  <p><strong>Shipping:</strong> ₹{order.shipping_cost}</p>
                  <h5><strong>Total Amount:</strong> ₹{order.total_amount}</h5>
                </div>

                <div className="text-center mt-4">
                  <Link to="/" className="btn btn-primary">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderConfirmation;
