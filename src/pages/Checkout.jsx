import React, { useState, useMemo, useContext } from "react";
import { Footer, Navbar } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/base_url";
import { clearCart } from "../redux/reducer/handleCart";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const Checkout = () => {
  const cartItems = useSelector((state) => state.handleCart);
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    billingAddress: "",
    shippingAddress: "",
    sameAsBilling: false,
    paymentMethod: "cod",
  });

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === "sameAsBilling") {
      setFormData((prev) => ({
        ...prev,
        sameAsBilling: checked,
        shippingAddress: checked ? prev.billingAddress : "",
      }));
    } else if (name === "billingAddress") {
      setFormData((prev) => ({
        ...prev,
        billingAddress: value,
        ...(prev.sameAsBilling ? { shippingAddress: value } : {}),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const { subtotal, shipping, totalAmount, totalItems } = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => {
      const priceToUse =
        item.offer_price && Number(item.offer_price) > 0
          ? Number(item.offer_price)
          : Number(item.price);
      return acc + priceToUse * item.qty;
    }, 0);
    const shipping = 30;
    const totalAmount = subtotal + shipping;
    const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
    return { subtotal, shipping, totalAmount, totalItems };
  }, [cartItems]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cartItems.length) {
      toast.error("Cart is empty!");
      return;
    }

    try {
      const itemsPayload = cartItems.map((item) => {
        const priceToUse =
          item.offer_price && Number(item.offer_price) > 0
            ? Number(item.offer_price)
            : Number(item.price);

        return {
          product: item.id,
          quantity: item.qty,
          price: priceToUse,
          total: priceToUse * item.qty,
        };
      });


      const payload = {
        customer: user.customer_details.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        billing_address: formData.billingAddress,
        shipping_address: formData.shippingAddress,
        payment_method: formData.paymentMethod,
        items: itemsPayload,
        subtotal,
        shipping_cost: shipping,
        total_amount: totalAmount,
      };

      const res = await api.post("orders/", payload);
      const { order, razorpay_order } = res.data;

      if (formData.paymentMethod === "online") {
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY,
          amount: razorpay_order.amount,
          currency: razorpay_order.currency,
          name: "My Shop",
          description: "Order Payment",
          order_id: razorpay_order.id,
          handler: async function (response) {
            try {
              await api.post("verify-payment/", {
                order_id: order.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              dispatch(clearCart());
              navigate(`/order-confirmation/${order.id}`);
            } catch (err) {
              toast.error("Payment verification failed");
              console.error(err);
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            contact: formData.phone,
          },
          theme: { color: "#7a563a" },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          toast.error("Payment failed or was cancelled. Please try again.");
          console.error("Payment failed:", response.error);
        });

        rzp.on("modal.closed", function () {
          toast("Payment window closed — order not completed.", { icon: "⚠️" });
        });

        rzp.open();
      } else {
        toast.success("Order placed with Cash on Delivery!");
        dispatch(clearCart());
        navigate(`/order-confirmation/${order.id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  };

  if (!cartItems.length) {
    return (
      <div className="container py-5 text-center">
        <h4 style={{ color: "#5b3b25" }}>No items in Cart</h4>
        <Link to="/" className="btn btn-outline-themed mt-3">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row my-4">
          <div className="col-md-5 col-lg-4 order-md-last mb-4">
            {/* Order Summary */}
            <div className="card mb-4 rounded-theme shadow-theme">
              <div className="card-header py-3 bg-light">
                <h5 style={{ color: "#5b3b25" }}>Order Summary</h5>
              </div>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between" style={{ color: "#7a563a" }}>
                    Products ({totalItems}) <span>₹{subtotal.toLocaleString()}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between" style={{ color: "#7a563a" }}>
                    Shipping <span>₹{shipping}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between" style={{ color: "#5b3b25", fontWeight: "bold" }}>
                    Total <span>₹{totalAmount.toLocaleString()}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-7 col-lg-8 mb-4">
            {/* Checkout Form */}
            <div className="card mb-4 rounded-theme shadow-theme">
              <div className="card-header py-3" style={{ color: "#5b3b25" }}>
                <h4>Billing & Shipping</h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control themed-input"
                        placeholder="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control themed-input"
                        placeholder="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <input
                        type="text"
                        className="form-control themed-input"
                        placeholder="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <textarea
                        className="form-control themed-input"
                        placeholder="Billing Address"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleChange}
                        required
                        rows={3}
                      />
                    </div>
                    <div className="col-12 form-check my-2">
                      <input
                        className="form-check-input themed-checkbox"
                        type="checkbox"
                        name="sameAsBilling"
                        checked={formData.sameAsBilling}
                        onChange={handleChange}
                        id="sameAsBilling"
                      />
                      <label className="form-check-label" htmlFor="sameAsBilling" style={{ color: "#7a563a" }}>
                        Shipping address same as billing
                      </label>
                    </div>
                    {!formData.sameAsBilling && (
                      <div className="col-12">
                        <textarea
                          className="form-control themed-input"
                          placeholder="Shipping Address"
                          name="shippingAddress"
                          value={formData.shippingAddress}
                          onChange={handleChange}
                          required
                          rows={3}
                        />
                      </div>
                    )}
                    <div className="col-12">
                      <select
                        className="form-select themed-select"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                      >
                        <option value="cod">Cash on Delivery</option>
                        <option value="online">Online Payment</option>
                      </select>
                    </div>
                  </div>
                  <hr className="my-4" />
                  <button type="submit" className="w-100 btn-themed btn-lg">
                    Place Order (₹{totalAmount.toLocaleString()})
                  </button>
                </form>
              </div>
            </div>
          </div>
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
          --text-muted: #777;
        }
        body, html, .container {
          background-color: var(--cream-bg);
        }
        .rounded-theme {
          border-radius: 12px !important;
        }
        .shadow-theme {
          box-shadow: 0 5px 14px rgba(122, 86, 58, 0.15) !important;
        }
        .text-theme-dark {
          color: var(--text-dark);
        }
        .themed-input {
          border-radius: 10px;
          border: 1px solid var(--brown-light);
          background: var(--cream-bg);
          color: var(--brown-dark);
          font-size: 1rem;
          padding: 8px 12px;
          transition: border-color 0.3s ease;
        }
        .themed-input:focus {
          border-color: var(--brown-dark);
          outline: none;
          background: #fff;
          box-shadow: 0 0 6px rgba(122, 86, 58, 0.25);
        }
        .themed-checkbox {
          cursor: pointer;
          accent-color: var(--brown-dark);
          width: 1.1rem;
          height: 1.1rem;
        }
        .themed-select {
          border-radius: 10px;
          border: 1px solid var(--brown-light);
          background: var(--cream-bg);
          color: var(--brown-dark);
          font-size: 1rem;
          padding: 6px 12px;
          transition: border-color 0.3s ease;
        }
        .themed-select:focus {
          border-color: var(--brown-dark);
          outline: none;
          background: #fff;
          box-shadow: 0 0 6px rgba(122, 86, 58, 0.25);
        }
        .btn-themed {
          background-color: var(--brown-dark);
          color: #fff !important;
          border-radius: 25px;
          font-weight: 600;
          padding: 12px 20px;
          border: none;
          text-align: center;
          transition: background-color 0.3s ease;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(122, 86, 58, 0.18);
        }
        .btn-themed:hover,
        .btn-themed:focus {
          background-color: var(--brown-darker);
          text-decoration: none;
          outline: none;
          box-shadow: 0 0 10px rgba(122, 86, 58, 0.6);
        }
        .btn-outline-themed {
          color: var(--brown-dark);
          border-color: var(--brown-dark);
          border-width: 2px;
          border-radius: 25px;
          font-weight: 600;
          padding: 8px 24px;
          transition: all 0.3s ease;
        }
        .btn-outline-themed:hover {
          background-color: var(--brown-dark);
          color: #fff;
          border-color: var(--brown-dark);
          text-decoration: none;
        }
        @media (max-width: 767px) {
          .col-md-5,
          .col-md-7 {
            flex: 0 0 100%;
            max-width: 100%;
          }
          .card-header h4 {
            font-size: 1.5rem;
          }
          .btn-themed {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </>
  );
};

export default Checkout;
