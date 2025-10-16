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
    preferredCourier: "",
  });

  const [errors, setErrors] = useState({});

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

    // Clear error as user types
    setErrors((prev) => ({ ...prev, [name]: "" }));
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    else if (!/^[0-9]{10}$/.test(formData.phone))
      newErrors.phone = "Enter a valid 10-digit phone number.";
    if (!formData.billingAddress.trim())
      newErrors.billingAddress = "Billing address is required.";
    if (!formData.sameAsBilling && !formData.shippingAddress.trim())
      newErrors.shippingAddress = "Shipping address is required.";
    if (!formData.preferredCourier)
      newErrors.preferredCourier = "Please select a courier.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill all required fields correctly.");
      return;
    }

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
        preferred_courier_service: formData.preferredCourier,
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
            } catch {
              toast.error("Payment verification failed");
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            contact: formData.phone,
          },
          theme: { color: "#7a563a" },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", () => {
          toast.error("Payment failed. Try again.");
        });
        rzp.open();
      } else {
        toast.success("Order placed successfully!");
        dispatch(clearCart());
        navigate(`/order-confirmation/${order.id}`);
      }
    } catch {
      toast.error("Something went wrong!");
    }
  };

  if (!cartItems.length) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-theme-dark">No items in Cart</h4>
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
        <div className="row g-4">
          {/* Order Summary */}
          <div className="col-lg-4 col-md-5 order-md-last">
            <div className="card shadow-theme rounded-theme">
              <div className="card-header bg-light">
                <h5 className="m-0 text-theme-dark">Order Summary</h5>
              </div>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between">
                    Products ({totalItems}) <strong>₹{subtotal}</strong>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    Shipping <strong>₹{shipping}</strong>
                  </li>
                  <li className="list-group-item d-flex justify-content-between text-theme-dark fw-bold">
                    Total <strong>₹{totalAmount}</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Billing & Shipping Form */}
          <div className="col-lg-8 col-md-7">
            <div className="card shadow-theme rounded-theme">
              <div className="card-header bg-light">
                <h5 className="m-0 text-theme-dark">Billing & Shipping</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit} className="checkout-form">
                  <div className="row g-3">
                    {/* First Name */}
                    <div className="col-sm-6">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        className={`form-control themed-input ${
                          errors.firstName ? "is-invalid" : ""
                        }`}
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                      {errors.firstName && (
                        <div className="error-text">{errors.firstName}</div>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="col-sm-6">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        className={`form-control themed-input ${
                          errors.lastName ? "is-invalid" : ""
                        }`}
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                      {errors.lastName && (
                        <div className="error-text">{errors.lastName}</div>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="col-sm-6">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        name="phone"
                        className={`form-control themed-input ${
                          errors.phone ? "is-invalid" : ""
                        }`}
                        value={formData.phone}
                        onChange={handleChange}
                      />
                      {errors.phone && (
                        <div className="error-text">{errors.phone}</div>
                      )}
                    </div>

                    {/* Preferred Courier */}
                    <div className="col-sm-6">
                      <label className="form-label">Preferred Courier</label>
                      <select
                        className={`form-select themed-select ${
                          errors.preferredCourier ? "is-invalid" : ""
                        }`}
                        name="preferredCourier"
                        value={formData.preferredCourier}
                        onChange={handleChange}
                      >
                        <option value="">Select Courier</option>
                        <option value="Professional courier">
                          Professional Courier
                        </option>
                        <option value="ST courier">ST Courier</option>
                        <option value="DTDC courier">DTDC Courier</option>
                      </select>
                      {errors.preferredCourier && (
                        <div className="error-text">
                          {errors.preferredCourier}
                        </div>
                      )}
                    </div>

                    {/* Billing Address */}
                    <div className="col-12">
                      <label className="form-label">Billing Address</label>
                      <textarea
                        name="billingAddress"
                        rows="3"
                        className={`form-control themed-input ${
                          errors.billingAddress ? "is-invalid" : ""
                        }`}
                        value={formData.billingAddress}
                        onChange={handleChange}
                      ></textarea>
                      {errors.billingAddress && (
                        <div className="error-text">{errors.billingAddress}</div>
                      )}
                    </div>

                    {/* Same as Billing */}
                    <div className="col-12 form-check my-2">
                      <input
                        type="checkbox"
                        className="form-check-input themed-checkbox"
                        name="sameAsBilling"
                        checked={formData.sameAsBilling}
                        onChange={handleChange}
                        id="sameAsBilling"
                      />
                      <label htmlFor="sameAsBilling" className="form-check-label">
                        Shipping address same as billing
                      </label>
                    </div>

                    {/* Shipping Address */}
                    {!formData.sameAsBilling && (
                      <div className="col-12">
                        <label className="form-label">Shipping Address</label>
                        <textarea
                          name="shippingAddress"
                          rows="3"
                          className={`form-control themed-input ${
                            errors.shippingAddress ? "is-invalid" : ""
                          }`}
                          value={formData.shippingAddress}
                          onChange={handleChange}
                        ></textarea>
                        {errors.shippingAddress && (
                          <div className="error-text">
                            {errors.shippingAddress}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payment Method */}
                    <div className="col-12">
                      <label className="form-label">Payment Method</label>
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
                    Place Order (₹{totalAmount})
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
          --brown-light: #f1e6d4;
          --cream-bg: #fffaf4;
          --error-color: #b3261e;
        }

        .error-text {
          color: var(--error-color);
          font-size: 0.85rem;
          margin-top: 2px;
          margin-left: 2px;
        }

        .is-invalid {
          border-color: var(--error-color) !important;
        }

        @media (max-width: 768px) {
          .error-text {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  );
};

export default Checkout;
