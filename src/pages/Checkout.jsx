import React, { useState, useMemo } from "react";
import { Footer, Navbar } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/base_url";
import { clearCart } from "../redux/reducer/handleCart";

const Checkout = () => {
  const cartItems = useSelector((state) => state.handleCart); // no updates during typing
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

  // Memoize totals to prevent unnecessary re-renders
  const { subtotal, shipping, totalAmount, totalItems } = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shipping = 30;
    const totalAmount = subtotal + shipping;
    const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
    return { subtotal, shipping, totalAmount, totalItems };
  }, [cartItems]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cartItems.length) {
      alert("Cart is empty!");
      return;
    }

    try {
      const itemsPayload = cartItems.map((item) => ({
        product: item.id,
        quantity: item.qty,
        price: item.price,
      }));

      const payload = {
        customer: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
        },
        billing_address: formData.billingAddress,
        shipping_address: formData.shippingAddress,
        payment_method: formData.paymentMethod,
        items: itemsPayload,
        subtotal,
        shipping_cost: shipping,
        total_amount: totalAmount,
      };

      const res = await api.post("orders/", payload);
      const orderId = res.data.data.id;

      if (formData.paymentMethod === "online") {
        const payRes = await api.post("create-payment/", {
          order_id: orderId,
          amount: totalAmount,
        });

        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY,
          amount: payRes.data.amount * 100,
          currency: "INR",
          name: "My Shop",
          description: "Order Payment",
          order_id: payRes.data.order_id,
          handler: async function (response) {
            await api.post("verify-payment/", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId,
            });
            dispatch(clearCart());
            navigate(`/order-confirmation/${orderId}`);
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            contact: formData.phone,
          },
          theme: { color: "#3399cc" },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // COD
        alert("Order placed with Cash on Delivery!");
        dispatch(clearCart());
        navigate(`/order-confirmation/${orderId}`);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  if (!cartItems.length) {
    return (
      <div className="container py-5 text-center">
        <h4>No items in Cart</h4>
        <Link to="/" className="btn btn-outline-dark mt-3">
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
          <div className="col-md-5 col-lg-4 order-md-last">
            {/* Order Summary */}
            <div className="card mb-4">
              <div className="card-header py-3 bg-light">
                <h5>Order Summary</h5>
              </div>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between">
                    Products ({totalItems}) <span>₹{subtotal}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    Shipping <span>₹{shipping}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <strong>Total</strong> <strong>₹{totalAmount}</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-7 col-lg-8">
            {/* Checkout Form */}
            <div className="card mb-4">
              <div className="card-header py-3">
                <h4>Billing & Shipping</h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control"
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
                        className="form-control"
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
                        className="form-control"
                        placeholder="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <textarea
                        className="form-control"
                        placeholder="Billing Address"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12 form-check my-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="sameAsBilling"
                        checked={formData.sameAsBilling}
                        onChange={handleChange}
                        id="sameAsBilling"
                      />
                      <label className="form-check-label" htmlFor="sameAsBilling">
                        Shipping address same as billing
                      </label>
                    </div>
                    {!formData.sameAsBilling && (
                      <div className="col-12">
                        <textarea
                          className="form-control"
                          placeholder="Shipping Address"
                          name="shippingAddress"
                          value={formData.shippingAddress}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    )}
                    <div className="col-12">
                      <select
                        className="form-select"
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
                  <button type="submit" className="w-100 btn btn-primary">
                    Place Order (₹{totalAmount})
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
