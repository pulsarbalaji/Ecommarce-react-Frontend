import React, { useEffect, useState } from "react";
import { Footer, Navbar } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { addCart, delCart } from "../redux/action";
import { Link } from "react-router-dom";
import api from "../utils/base_url";
import toast from "react-hot-toast";

const Cart = () => {
  const [shipping, setShipping] = useState(0);
  const [GST, setGST] = useState(0);
  const [stocks, setStocks] = useState({});
  const state = useSelector((state) => state.handleCart);
  const dispatch = useDispatch();

  const addItem = (product) => {
  const availableStock = stocks[product.id];
  if (availableStock && product.qty >= availableStock) {
    toast.error(`Only ${availableStock} in stock for ${product.product_name}`);
    return;
  }
  dispatch(addCart(product));
};

  const removeItem = (product) => dispatch(delCart(product));

  const EmptyCart = () => (
    <div className="container">
      <div className="row">
        <div className="col-12 py-5 bg-light text-center rounded-theme">
          <h4 className="p-3 display-5" style={{ color: "#198754" }}>
            Your Cart is Empty
          </h4>
          <Link to="/" className="btn btn-outline-themed mx-4">
            <i className="fa fa-arrow-left"></i> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );

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

useEffect(() => {
  const getStock = async () => {
    try {
      const stockData = {};
      for (const item of state) {
        const res = await api.get(`stock/?product_id=${item.id}`);
        stockData[item.id] = res.data.stock; // assuming API returns { stock: number }
      }
      setStocks(stockData);
    } catch (error) {
      console.error("Stock fetch error:", error);
    }
  };

  if (state.length > 0) {
    getStock();
  }
}, [state]);




  const ShowCart = () => {
    let subtotal = 0;
    const shippingCost = Number(shipping) || 0;
    const gstPercent = Number(GST) || 0; 
    let totalItems = 0;
    
    state.forEach((item) => {
      // Use offer price if available and valid else normal price
      const priceToUse =
      item.offer_price && Number(item.offer_price) > 0
      ? Number(item.offer_price)
      : Number(item.price);
      subtotal += priceToUse * item.qty;
      totalItems += item.qty;
      
    });
    const gstAmount = (subtotal * gstPercent) / 100;
    const totalAmount = subtotal + gstAmount + shippingCost;

    return (
      <section className="h-100 gradient-custom-themed">
        <div className="container py-5">
          <div className="row d-flex justify-content-center my-4">
            {/* Cart items */}
            <div className="col-lg-8 col-md-10 col-12 mb-4">
              <div className="card mb-4 rounded-theme shadow-theme">
                <div className="card-header py-3 bg-light">
                  <h5 className="mb-0 text-theme-dark">Item List</h5>
                </div>
                <div className="card-body p-3">
                  {state.map((item) => {
                    // Calculate price to show per item
                    const priceToUse =
                      item.offer_price && Number(item.offer_price) > 0
                        ? Number(item.offer_price)
                        : Number(item.price);
                    const originalPrice =
                      item.offer_price && Number(item.offer_price) > 0
                        ? Number(item.price)
                        : null;

                    return (
                      <div
                        key={item.id}
                        className="mb-3 pb-3 border-bottom border-theme-light"
                      >
                        <div className="row align-items-center g-2">
                          <div className="col-4 col-sm-3 text-center">
                            <img
                              src={`${process.env.REACT_APP_API_URL}${item.product_image}`}
                              alt={item.product_name}
                              className="rounded-theme img-fluid"
                              style={{ maxHeight: "90px", objectFit: "contain" }}
                            />
                          </div>

                          <div className="col-8 col-sm-5">
                            <p
                              className="text-theme-dark fw-semibold mb-1"
                              style={{ fontSize: "1rem" }}
                            >
                              {item.product_name}
                            </p>
                            <p
                              className="text-theme-muted mb-1"
                              style={{ fontSize: "0.9rem" }}
                            >
                              ₹ {priceToUse.toLocaleString()} each{" "}
                              {originalPrice && (
                                <span style={{ fontSize: "0.8rem", textDecoration: "line-through", color: "#ff0000ff", marginLeft: "6px" }}>
                                  ₹ {originalPrice.toLocaleString()}
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="col-12 col-sm-4 d-flex align-items-center justify-content-between justify-content-sm-end gap-2">
                            <div
                              className="input-group input-group-sm quantity-controls"
                              style={{ maxWidth: "120px" }}
                            >
                              <button
                                className="btn btn-themed-outline"
                                onClick={() => removeItem(item)}
                                aria-label={`Remove one ${item.product_name}`}
                              >
                                <i className="fas fa-minus"></i>
                              </button>
                              <span className="input-group-text qty-display">
                                {item.qty}
                              </span>
                              <button
                                className="btn btn-themed-outline"
                                onClick={() => addItem(item)}
                                aria-label={`Add one ${item.product_name}`}
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            </div>
                            <p
                              className="text-theme-dark fw-bold mb-0 ps-3"
                              style={{
                                minWidth: "90px",
                                textAlign: "right",
                                fontSize: "1rem",
                              }}
                            >
                              ₹ {(priceToUse * item.qty).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="col-lg-4 col-md-8 col-12 mb-4">
              <div className="card rounded-theme shadow-theme">
                <div className="card-header py-3 bg-light border-theme-light">
                  <h5 className="mb-0 text-theme-dark">Order Summary</h5>
                </div>
                <div className="card-body p-3">
                  <ul className="list-group list-group-flush mb-3">
                    <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0 text-theme-dark">
                      Products ({totalItems})
                      <span>₹{Math.round(subtotal).toLocaleString()}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0 text-theme-dark">
                      Shipping
                      <span>₹{shippingCost.toLocaleString()}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0 text-theme-dark">
                      GST {GST.toLocaleString()}%
                      <span>₹{gstAmount.toLocaleString()}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 mb-0 text-theme-dark">
                      <strong>Total amount</strong>
                      <span>
                        <strong>₹{totalAmount.toLocaleString()}</strong>
                      </span>
                    </li>
                  </ul>

                  <Link to="/checkout" className="btn-themed btn-lg w-100 text-center">
                    Go to checkout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1 className="text-center text-theme-dark">Cart</h1>
        <hr className="border-theme-light" />
        {state.length > 0 ? <ShowCart /> : <EmptyCart />}
      </div>
      <Footer />

      {/* CSS Styles: */}
      <style>{`
        :root {
          --brown-dark: rgb(112,168,77);
          --brown-darker: #198754;
          --brown-light: #f1e6d4;
          --cream-bg: #fffaf4;
          --text-dark: #198754;
          --text-medium: #7a563a;
          --text-muted: #000000ff;
        }
        body, html, .container {
          background-color: var(--cream-bg);
        }
        .text-theme-dark { color: var(--text-dark); }
        .text-theme-muted { color: var(--text-muted); }
        .bg-light { background-color: var(--cream-bg) !important; }
        .border-theme-light { border-color: var(--brown-light) !important; }
        .btn-themed {
          background-color: var(--brown-dark);
          color: #fff !important;
          border-radius: 25px;
          text-decoration: none;
          font-weight: 600;
          padding: 12px 20px;
          border: none;
          display: inline-block;
          text-align: center;
          transition: background-color 0.3s ease;
          cursor: pointer;
          user-select: none;
          box-shadow: 0 2px 6px rgba(122, 86, 58, 0.18);
          width: 100%;
        }
        .btn-themed:hover, .btn-themed:focus {
          background-color: var(--brown-darker);
          text-decoration: none;
          outline: none;
          box-shadow: 0 0 10px rgba(122, 86, 58, 0.6);
        }
        .btn-themed-outline {
          background-color: transparent;
          color: var(--brown-dark) !important;
          border: 1.5px solid var(--brown-dark);
          border-radius: 25px;
          font-weight: 600;
          padding: 5px 10px;
          cursor: pointer;
          user-select: none;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 30px;
          height: 32px;
        }
        .btn-themed-outline:hover, .btn-themed-outline:focus {
          background-color: var(--brown-dark);
          color: #198754 !important;
          border-color: var(--brown-dark);
          outline: none;
          box-shadow: 0 0 8px rgba(122, 86, 58, 0.6);
          text-decoration: none;
        }
        .rounded-theme { border-radius: 12px !important; }
        .shadow-theme { box-shadow: 0 5px 14px rgba(122, 86, 58, 0.15) !important; }
        .gradient-custom-themed { background: var(--cream-bg); }
        .input-group-text.qty-display {
          background: var(--cream-bg);
          color: var(--text-dark);
          font-weight: 600;
          min-width: 35px;
          text-align: center;
          border: 1.5px solid var(--brown-light);
          border-radius: 0 0.4rem 0.4rem 0;
          padding: 0.35rem 0.5rem;
        }
        @media (max-width: 768px) {
          .card-body > div {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .input-group.input-group-sm.quantity-controls {
            max-width: 100% !important;
            width: 100%;
            margin-top: 10px;
          }
          .qty-display { min-width: 45px !important; }
          .btn-themed-outline { min-width: 35px; height: 35px; }
          .btn-themed { padding: 10px; font-size: 1rem; }
        }
      `}</style>
    </>
  );
};

export default Cart;
