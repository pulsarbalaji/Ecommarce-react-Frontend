import React from "react";
import ReactDOM from "react-dom/client";
import "../node_modules/font-awesome/css/font-awesome.min.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";

import {
  Home,
  Product,
  Products,
  AboutPage,
  ContactPage,
  Cart,
  Login,
  Register,
  Checkout,
  PageNotFound,
  Verification,
} from "./pages";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfileUpdateForm from "./pages/ProfileUpdateForm";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId="894528088345-4e1pbin29dladn3uafe44450espqu0lk.apps.googleusercontent.com">
      <AuthProvider>
        <ScrollToTop>
          <Provider store={store}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product" element={<Products />} />
              
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              <Route path="/profile" element={<ProfileUpdateForm />} />

              {/* Protected Routes */}
              <Route path="/cart" element={<ProtectedRoute> <Cart /> </ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute> <Checkout /> </ProtectedRoute>} />
              <Route path="/product/:id" element={ <ProtectedRoute> <Product /> </ProtectedRoute> } />

              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verification" element={<Verification />} />

              {/* Fallback */}
              <Route path="*" element={<PageNotFound />} />
              <Route path="/product/*" element={<PageNotFound />} />
            </Routes>

          </Provider>
        </ScrollToTop>
      </AuthProvider>
    </GoogleOAuthProvider>
    <Toaster />
  </BrowserRouter>
);
