import React from "react";
import ReactDOM from "react-dom/client";
import "../node_modules/font-awesome/css/font-awesome.min.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import '@fortawesome/fontawesome-free/css/all.min.css';

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
  OrderConfirmation,
} from "./pages";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfileUpdateForm from "./pages/ProfileUpdateForm";
import OrderTracking from "./pages/OrderTracking";
import OrderHistory from "./pages/OrderHistory";
import WhatsAppWidget from "./pages/WhatsAppWidget";
import InstagramWidget from "./pages/Instagramwidget";
import OfferModal from "./components/OfferModal";
import PasswordReset from "./pages/PasswordReset";
import PasswordResetConfirm from "./pages/PasswordResetConfirm";


const AppContent = () => {
  const location = useLocation();

  const hideOnRoutes = ["/login", "/register", "/verification", "/checkout","/passwordreset","/reset-password"];
  const shouldHide = hideOnRoutes.includes(location.pathname);

  return (
    <>
      {/* Conditionally render these only when not hidden */}
      {!shouldHide && (
        <>

          <OfferModal />
        </>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product" element={<Products />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/profile" element={<ProfileUpdateForm />} />

        {/* Protected Routes */}
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/product/:id" element={<ProtectedRoute><Product /></ProtectedRoute>} />
        <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
        <Route path="/order-tracking/:orderNumber" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
        <Route path="/orderhistory" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/passwordreset" element={<PasswordReset />} />
        <Route path="/reset-password/:uid/:token" element={<PasswordResetConfirm />} />

        {/* Fallback */}
        <Route path="*" element={<PageNotFound />} />
        <Route path="/product/*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId="894528088345-4e1pbin29dladn3uafe44450espqu0lk.apps.googleusercontent.com">
      <AuthProvider>
        <ScrollToTop>
          <Provider store={store}>
            <WhatsAppWidget />
            <InstagramWidget />
            <AppContent />
          </Provider>
        </ScrollToTop>
      </AuthProvider>
    </GoogleOAuthProvider>
    <Toaster />
  </BrowserRouter>
);
