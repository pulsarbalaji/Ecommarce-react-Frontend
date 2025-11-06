import React, { useState, useMemo, useContext, useEffect } from "react";
import { Footer, Navbar } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/base_url";
import { clearCart } from "../redux/reducer/handleCart";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import '../styles/index.css';
const Checkout = () => {
  const cartItems = useSelector((state) => state.handleCart);
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    contact_number: "",
    secondary_number: "",
    billingAddress: "",
    shippingAddress: "",
    sameAsBilling: false,
    paymentMethod: "online",
    preferredCourier: "",
  });

  const [errors, setErrors] = useState({});
  const [shipping, setShipping] = useState(0);
  const [GST, setGST] = useState(0);

  useEffect(() => {
    const getShippingCharge = async () => {
      try {
        const res = await api.get("settings/courier-charge/"); // API endpoint
        setShipping(Number(res.data.courier_charge)); // Adjust key if different
      } catch (error) {
        console.error("Shipping fetch error:", error);
        setShipping(0); // fallback
      }
    };

    getShippingCharge();
  }, []);

  useEffect(() => {
    const getGST = async () => {
      try {
        const res = await api.get("settings/gst/"); // API endpoint
        setGST(Number(res.data.gst_percentage)); // Adjust key if different
      } catch (error) {
        console.error("GST fetch error:", error);
        setGST(0); // fallback
      }
    };

    getGST();
  }, []);
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

  const { subtotal, gstPercent, gstAmount, shippingCost, totalAmount, totalItems } = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => {
      const priceToUse =
        item.offer_price && Number(item.offer_price) > 0
          ? Number(item.offer_price)
          : Number(item.price);

      return acc + priceToUse * item.qty;
    }, 0);

    const shippingCost = Number(shipping);
    const gstPercent = Number(GST) || 0; // % from backend
    const gstAmount = (subtotal * gstPercent) / 100; // GST value

    const totalAmount = subtotal + gstAmount + shippingCost;
    const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

    return { subtotal, gstPercent, gstAmount, shippingCost, totalAmount, totalItems };
  }, [cartItems, shipping, GST]);


  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required.";
    if (!formData.contact_number.trim()) newErrors.contact_number = "Phone number is required.";
    else if (!/^[0-9]{10}$/.test(formData.contact_number))
      newErrors.contact_number = "Enter a valid 10-digit phone number.";

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
    if (Object.keys(newErrors).length > 0) return toast.error("Fix form errors");
    if (!cartItems.length) return toast.error("Cart is empty!");

    // Build order payload
    const itemsPayload = cartItems.map((item) => {
      const price = item.offer_price > 0 ? item.offer_price : item.price;
      return { product: item.id, quantity: item.qty, price, total: price * item.qty };
    });

    const orderPayload = {
      auth_id: user.id,
      customer: user.customer_details.id,
      first_name: formData.first_name,
      last_name: formData.last_name,
      contact_number: formData.contact_number,
      secondary_number: formData.secondary_number,
      preferred_courier_service: formData.preferredCourier,
      billing_address: formData.billingAddress,
      shipping_address: formData.shippingAddress,
      payment_method: formData.paymentMethod,
      items: itemsPayload,
      subtotal,
      tax: GST,
      shipping_cost: shippingCost,
      total_amount: totalAmount,
    };

    // ===============================================================
    // 🧾 1️⃣ CASH ON DELIVERY
    // ===============================================================
    if (formData.paymentMethod === "cod") {
      try {
        const res = await api.post("orders/create-cod/", { order_data: orderPayload });
        toast.success("Order placed successfully!");
        dispatch(clearCart());
        navigate(`/order-confirmation/${res.data.order.id}`);
      } catch (err) {
        const msg = err.response?.data?.message || "Something went wrong!";
        toast.error(msg);
      }
      return;
    }

    // ===============================================================
    // 💳 2️⃣ ONLINE PAYMENT FLOW (safe)
    // ===============================================================
    try {
      // Step 1: Reserve stock and create Razorpay order
      const reserveRes = await api.post("orders/reserve/", {
        ...orderPayload,
        payment_method: "online",
      });

      if (!reserveRes.data.status) {
        toast.error(reserveRes.data.message);
        return;
      }

      const razorpayOrder = reserveRes.data.razorpay_order;

      // Step 2: Open Razorpay only if stock reserved
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.id,
        name: "My Shop",
        description: "Order Payment",
        handler: async function (response) {
          try {
            // Step 3: Verify payment and finalize order
            const verifyRes = await api.post("orders/verify/", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_data: orderPayload,
            });

            toast.success("Payment successful!");
            dispatch(clearCart());
            navigate(`/order-confirmation/${verifyRes.data.order.id}`);
          } catch (err) {
            const msg =
              err.response?.data?.message || "Product might be out of stock now.";
            toast.error(msg);
          }
        },
        prefill: {
          name: `${formData.first_name} ${formData.last_name}`,
          contact: formData.contact_number,
        },
        theme: { color: "#198754" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => toast.error("Payment failed"));
      rzp.open();
    } catch (err) {
      const msg = err.response?.data?.message || "Unable to initiate payment";
      toast.error(msg);
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
                    Shipping <strong>₹{shippingCost}</strong>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    GST ({gstPercent}%) <strong>₹{gstAmount.toFixed(2)}</strong>
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
                      <label className="form-label required">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        maxLength="15"
                        className={`form-control themed-input ${errors.first_name ? "is-invalid" : ""
                          }`}
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                      />
                      {errors.first_name && (
                        <div className="error-text">{errors.first_name}</div>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="col-sm-6">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        maxLength="15"
                        className={`form-control themed-input ${errors.last_name ? "is-invalid" : ""
                          }`}
                        value={formData.last_name}
                        onChange={handleChange}
                      />

                    </div>

                    {/* Phone */}
                    <div className="col-sm-6">
                      <label className="form-label required">Contact Number</label>
                      <input
                        type="phone"
                        name="contact_number"
                        maxLength="10"
                        className={`form-control themed-input ${errors.contact_number ? "is-invalid" : ""
                          }`}
                        value={formData.contact_number}
                        onChange={handleChange}
                        required
                      />
                      {errors.contact_number && (
                        <div className="error-text">{errors.contact_number}</div>
                      )}
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label">Secondary Number</label>
                      <input
                        type="phone"
                        name="secondary_number"
                        maxLength="10"
                        className={`form-control themed-input ${errors.secondary_number ? "is-invalid" : ""
                          }`}
                        value={formData.secondary_number}
                        onChange={handleChange}
                      />

                    </div>

                    {/* Preferred Courier */}
                    <div className="col-sm-6">
                      <label className="form-label required">Preferred Courier</label>
                      <select
                        className={`form-select themed-select ${errors.preferredCourier ? "is-invalid" : ""
                          }`}
                        name="preferredCourier"
                        value={formData.preferredCourier}
                        onChange={handleChange}
                        required
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
                      <label className="form-label required">Billing Address</label>
                      <textarea
                        name="billingAddress"
                        rows="3"
                        className={`form-control themed-input ${errors.billingAddress ? "is-invalid" : ""
                          }`}
                        value={formData.billingAddress}
                        onChange={handleChange}
                        required
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
                        <label className="form-label required">Shipping Address</label>
                        <textarea
                          name="shippingAddress"
                          rows="3"
                          className={`form-control themed-input ${errors.shippingAddress ? "is-invalid" : ""
                            }`}
                          value={formData.shippingAddress}
                          onChange={handleChange}
                          required
                        ></textarea>
                        {errors.shippingAddress && (
                          <div className="error-text">
                            {errors.shippingAddress}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payment Method */}
                    {/* <div className="col-12">
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
                    </div> */}
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
          --brown-dark: #198754;
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
          .form-label.required::after {
          content: " *";
          color: red;
          font-weight: bold;
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
