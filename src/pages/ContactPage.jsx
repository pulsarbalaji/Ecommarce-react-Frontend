import React, { useState } from "react";
import { Footer, Navbar } from "../components";
import api from "../utils/base_url";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMsg(null);

    try {
      const res = await api.post("contactus/", formData);
      if (res.data.success || res.data.status) {
        setResponseMsg("✅ Message sent successfully!");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        setResponseMsg("⚠️ Something went wrong. Try again!");
      }
    } catch (error) {
      setResponseMsg("❌ Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h3 className="text-center" style={{ color: "#198754", fontWeight: 700 }}>
          Contact Us
        </h3>
        <hr />
        <div className="row my-4 h-100">
          <div className="col-md-4 col-lg-4 col-sm-8 mx-auto">
            <form onSubmit={handleSubmit} className="contact-form-card">
              <div className="form my-3">
                <label htmlFor="Name">Name</label>
                <input
                  type="text"
                  className="form-control input-style"
                  id="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="form my-3">
                <label htmlFor="Email">Email</label>
                <input
                  type="email"
                  className="form-control input-style"
                  id="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="form my-3">
                <label htmlFor="Phone">Phone Number</label>
                <input
                  type="tel"
                  className="form-control input-style"
                  id="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div className="form my-3">
                <label htmlFor="Message">Message</label>
                <textarea
                  rows={5}
                  className="form-control input-style"
                  id="Message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Enter your message"
                  required
                />
              </div>
              <div className="text-center">
                <button
                  className="my-2 px-4 mx-auto btn-send"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
            {responseMsg && (
              <p className="text-center mt-3" style={{ color: "#7a563a" }}>
                {responseMsg}
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />

      <style>{`
.contact-form-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 5px 14px rgba(122, 86, 58, 0.06);
  border: 1px solid #f1e6d4;
  padding: 24px 28px;
  margin-bottom: 24px;
}
.input-style {
  border-radius: 8px;
  border: 1px solid #f1e6d4;
  background: #fffaf4;
  color: #7a563a;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-shadow: none;
}
.input-style:focus {
  border-color: #7a563a;
  outline: none;
  background: #fff;
}
.form label {
  color: #198754;
  font-weight: 600;
  margin-bottom: 4px;
}
.btn-send {
  background-color: rgb(112,168,77);;
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 25px;
  border: none;
  padding: 8px 32px;
  transition: background 0.3s;
  box-shadow: 0 2px 6px rgba(122, 86, 58, 0.09);
  display: inline-block;
}
.btn-send:active,
.btn-send:focus {
  background-color: #68492f;
}
.btn-send:hover:not(:disabled) {
  background-color: #68492f;
}
@media (max-width: 767px) {
  .contact-form-card {
    padding: 14px 8px;
  }
  .btn-send {
    padding: 7px 18px;
    font-size: 0.95rem;
  }
  .input-style {
    font-size: 0.97rem;
  }
}
      `}</style>
    </>
  );
};

export default ContactPage;
