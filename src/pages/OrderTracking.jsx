import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar, Footer } from "../components";
import api from "../utils/base_url";
import toast from "react-hot-toast";

const OrderTracking = () => {
  const { orderNumber } = useParams(); // e.g., /order-tracking/:orderNumber
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  // --- Feedback Modal States ---
  const [showModal, setShowModal] = useState(false);
  const [feedbackProduct, setFeedbackProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const openFeedbackModal = async (item) => {
    const productId = item?.product || item?.product_id || item?.id;

    if (!productId) {
      toast.error("Invalid product");
      return;
    }

    const productName = item?.product_name || item?.product?.product_name || "Product";

    setFeedbackProduct({ id: productId, name: productName });
    setRating(0);
    setComment("");
    setShowModal(true);

    // 🟢 Try fetching existing feedback for this product
    try {
      const res = await api.get(`feedback/${productId}/`); // example endpoint: GET /feedback/5/
      if (res.data?.data) {
        const fb = res.data.data;
        setRating(Number(fb.rating || 0));
        setComment(fb.comment || "");
      }
    } catch (err) {
      // No existing feedback → ignore
      if (err.response?.status !== 404) {
        console.warn("Feedback fetch error:", err);
      }
    }
  };
  const submitFeedback = async () => {
    if (!feedbackProduct?.id) return toast.error("Invalid product");
    if (!rating) return toast.error("Please select a star rating");
    if (comment.trim().length > 1000)
      return toast.error("Comment can’t exceed 1000 characters");

    try {
      const payload = { rating, comment };
      await api.post(`feedback/${feedbackProduct.id}/`, payload);
      toast.success("Feedback submitted successfully!");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit feedback");
    }
  };




  // Get order ID from URL

  const downloadInvoice = async () => {
    try {
      const response = await api.get(`orderspdf/${order.id}/`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${order.order_number}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("PDF Download Error:", error);
      toast.error("Failed to download invoice");
    }
  };



  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`order-tracking/${orderNumber}/`);
        setOrder(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <h5 style={{ color: "#198754" }}>Loading order details...</h5>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5 text-center">
        <h5 style={{ color: "#198754" }}>No order found</h5>
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
            <h5 className="text-theme-dark">Order Number#{order.order_number}</h5>
            <p className="mb-1">
              <strong>Status:</strong>{" "}
              <span className={`badge ${order.status === "delivered" ? "bg-success" : "bg-warning text-dark"} text-uppercase`}>
                {order.status}
              </span>
            </p>
            <p className="mb-1 text-theme-dark">
              <strong>preferred Courier:</strong> {order.preferred_courier_service}
            </p>
            <p className="mb-1 text-theme-dark">
              <strong>Courier Number:</strong> {order.courier_number}
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
                    <td className="product-cell">
                      <div className="product-info">
                        <span className="product-name">{item.product_name}</span>
                        {order.status === "delivered" && (
                          <button
                            className="btn-feedback ms-2 mt-2 mt-md-0"
                            onClick={() => openFeedbackModal(item)}
                          >
                            ⭐ Review
                          </button>
                        )}
                      </div>
                    </td>

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

        <div className="text-center d-flex justify-content-center gap-3">
          <Link to="/orderhistory">
            <button type="button" className="btn-themed">
              Back to Home
            </button>
          </Link>

          <button type="button" className="btn-themed pd-9" onClick={downloadInvoice}>
            Download Invoice
          </button>
        </div>

      </div>
      <Footer />
      <style>{`
  :root {
    --brown-dark: rgb(112,168,77);
    --brown-darker: #198754;
    --brown-light: #f1e6d4;
    --cream-bg: #fffaf4;
    --text-dark: rgb(112,168,77);
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

  /* === Feedback Modal === */
  .feedback-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .feedback-content {
    background: white;
    width: 90%;
    max-width: 450px;
    border-radius: 15px;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  .stars {
    display: flex;
    justify-content: center;
    font-size: 2rem;
    color: #ccc;
    cursor: pointer;
  }

  .star.active {
    color: gold;
    transform: scale(1.2);
    transition: transform 0.2s ease;
  }

  /* === Product Cell Layout === */
  .product-cell {
    vertical-align: middle;
  }

  .product-info {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .product-name {
    font-weight: 500;
    color: var(--text-dark);
    word-break: break-word;
  }

  /* === Feedback Button === */
  .btn-feedback {
    background-color: transparent;
    border: 1.5px solid var(--brown-dark);
    color: var(--brown-dark);
    font-weight: 600;
    border-radius: 25px;
    padding: 5px 14px;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .btn-feedback:hover {
    background-color: var(--brown-dark);
    color: #fff !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(112, 168, 77, 0.25);
  }

  /* === Responsive Tweaks === */
  /* === Responsive Fix: Center Review Button on Mobile === */
  @media (max-width: 768px) {
    .product-cell {
      display: flex;
      flex-direction: column;
      align-items: center; /* centers horizontally */
      justify-content: center;
      padding: 8px 0;
      text-align: center;
    }

    .product-info {
      width: 100%;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 6px;
    }

    .product-name {
      width: 100%;
      text-align: center;
      font-size: 1rem;
    }

    .btn-feedback {
      width: 80%; /* nice touch target, not edge-to-edge */
      justify-content: center;
      margin-top: 6px;
      align-self: center;
      text-align: center;
    }
  }

/* Optional for very small screens */
@media (max-width: 480px) {
  .btn-feedback {
    width: 90%;
    font-size: 0.85rem;
  }
}

`}</style>

      {/* --- Feedback Modal --- */}
      {showModal && (
        <div className="feedback-modal">
          <div className="feedback-content p-4 rounded shadow">
            <h5 className="text-success fw-bold mb-3">
              Feedback for {feedbackProduct?.name}
            </h5>

            {/* ⭐ Star Rating */}
            <div className="stars mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= (hover || rating) ? "active" : ""}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(rating)}
                >
                  ★
                </span>
              ))}
            </div>

            {/* 💬 Comment */}
            <textarea
              className="form-control mb-3"
              rows="3"
              placeholder="Write your feedback (max 1000 characters)"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 1000))}
            />

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-success" onClick={submitFeedback}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default OrderTracking;
