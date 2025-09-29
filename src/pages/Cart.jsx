import React from "react";
import { Footer, Navbar } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { addCart, delCart } from "../redux/action";
import { Link } from "react-router-dom";

const Cart = () => {
  const state = useSelector((state) => state.handleCart);
  const dispatch = useDispatch();

  const addItem = (product) => dispatch(addCart(product));
  const removeItem = (product) => dispatch(delCart(product));

  const EmptyCart = () => (
    <div className="container">
      <div className="row">
        <div className="col-md-12 py-5 bg-light text-center">
          <h4 className="p-3 display-5">Your Cart is Empty</h4>
          <Link to="/" className="btn btn-outline-dark mx-4">
            <i className="fa fa-arrow-left"></i> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );

  const ShowCart = () => {
    let subtotal = 0;
    let shipping = 30.0;
    let totalItems = 0;

    state.forEach((item) => {
      subtotal += item.price * item.qty;
      totalItems += item.qty;
    });

    return (
      <section className="h-100 gradient-custom">
        <div className="container py-5">
          <div className="row d-flex justify-content-center my-4">
            {/* Cart items */}
            <div className="col-md-8">
              <div className="card mb-4">
                <div className="card-header py-3">
                  <h5 className="mb-0">Item List</h5>
                </div>
                <div className="card-body">
                  {state.map((item) => (
                    <div key={item.id}>
                      <div className="row d-flex align-items-center">
                        <div className="col-lg-3 col-md-12 text-center">
                          <img
                            src={`http://127.0.0.1:8000${item.product_image}`} 
                            alt={item.product_name}
                            width={100}
                            height={75}
                            className="rounded"
                            style={{ objectFit: "contain" }}
                          />
                        </div>

                        <div className="col-lg-5 col-md-6">
                          <p>
                            <strong>{item.product_name}</strong>
                          </p>
                        </div>

                        <div className="col-lg-4 col-md-6">
                          <div
                            className="d-flex mb-2"
                            style={{ maxWidth: "200px" }}
                          >
                            <button
                              className="btn btn-outline-dark btn-sm"
                              onClick={() => removeItem(item)}
                            >
                              <i className="fas fa-minus"></i>
                            </button>

                            <p className="mx-3 mb-0 fw-bold">{item.qty}</p>

                            <button
                              className="btn btn-outline-dark btn-sm"
                              onClick={() => addItem(item)}
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>

                          <p className="text-start text-md-center mb-0">
                            <strong>
                              {item.qty} x ₹{Number(item.price).toLocaleString()}
                            </strong>
                          </p>
                        </div>
                      </div>

                      <hr className="my-4" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="col-md-4">
              <div className="card mb-4">
                <div className="card-header py-3 bg-light">
                  <h5 className="mb-0">Order Summary</h5>
                </div>
                <div className="card-body">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0">
                      Products ({totalItems})
                      <span>₹{Math.round(subtotal).toLocaleString()}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                      Shipping
                      <span>₹{shipping}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 mb-3">
                      <strong>Total amount</strong>
                      <span>
                        <strong>
                          ₹{Math.round(subtotal + shipping).toLocaleString()}
                        </strong>
                      </span>
                    </li>
                  </ul>

                  <Link to="/checkout" className="btn btn-dark btn-lg btn-block">
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
        <h1 className="text-center">Cart</h1>
        <hr />
        {state.length > 0 ? <ShowCart /> : <EmptyCart />}
      </div>
      <Footer />
    </>
  );
};

export default Cart;
