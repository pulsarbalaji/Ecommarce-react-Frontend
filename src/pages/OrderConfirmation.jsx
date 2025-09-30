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
        const res = await api.get(`orders/${orderId}/`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
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
          <div className="col-md-8">
            <div className="card text-center">
              <div className="card-header bg-success text-white">
                <h4>Order Confirmed!</h4>
              </div>
              <div className="card-body">
                <h5 className="card-title mb-3">
                  Thank you, {order.customer.first_name} {order.customer.last_name}
                </h5>
                <p className="card-text">
                  Your order <strong>#{order.id}</strong> has been placed successfully.
                </p>
                <p className="card-text">
                  <strong>Total Amount:</strong> ₹{order.total_amount}
                </p>
                <p className="card-text">
                  <strong>Payment Method:</strong> {order.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}
                </p>
                <p className="card-text">
                  <strong>Shipping Address:</strong> {order.shipping_address}
                </p>
                <p className="card-text">
                  <strong>Billing Address:</strong> {order.billing_address}
                </p>

                <Link to="/" className="btn btn-primary mt-3">
                  Continue Shopping
                </Link>
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
