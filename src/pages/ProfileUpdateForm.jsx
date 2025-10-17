import React, { useState, useEffect, useContext } from "react";
import api from "../utils/base_url";
import { AuthContext } from "../context/AuthContext";

const ProfileUpdateForm = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    full_name: "",
    address: "",
    dob: "",
    gender: "",
    profile_image: null,
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (user?.customer_details?.id) {
      api.get(`/customerslist/${user.customer_details.id}/`).then((res) => {
        const data = res.data;
        setFormData({
          full_name: data.data.full_name || user.customer_details.full_name || "",
          address: data.data.address || user.customer_details.address || "",
          dob: data.data.dob || user.customer_details.dob || "",
          gender: data.data.gender || user.customer_details.gender || "",
          profile_image: null,
        });

        if (data.data.profile_image) {
          const imgUrl = data.data.profile_image.startsWith("http")
            ? data.data.profile_image
            : `${process.env.REACT_APP_API_URL}${data.data.profile_image}`;
          setPreview(imgUrl);
        } else if (user.login_method === "google" && user.customer_details.profile_image) {
          setPreview(user.customer_details.profile_image);
        } else if (user.profile_image) {
          setPreview(user.profile_image);
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_image" && files?.[0]) {
      setFormData({ ...formData, profile_image: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) fd.append(key, formData[key]);
    });

    try {
      if (user?.customer_details?.id) {
        await api.put(`customerdetails/${user.customer_details.id}/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("customerdetails/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      alert("Profile saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving profile. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      address: "",
      dob: "",
      gender: "",
      profile_image: null,
    });
    setPreview(null);
  };

  return (
    <div
      className="modal fade"
      id="profileModal"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="modal-header">
              <h5 className="modal-title" style={{ color: "#198754", fontWeight: "700" }}>
                Update Profile
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={resetForm}
              ></button>
            </div>

            <div className="modal-body">
              <div className="row g-3">
                {/* Full Name */}
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control themed-input"
                      id="fullName"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Full Name"
                    />
                    <label htmlFor="fullName">Full Name</label>
                  </div>
                </div>

                {/* Address */}
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control themed-input"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Address"
                    />
                    <label htmlFor="address">Address</label>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="date"
                      className="form-control themed-input"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      placeholder="Date of Birth"
                    />
                    <label htmlFor="dob">Date of Birth</label>
                  </div>
                </div>

                {/* Gender */}
                <div className="col-md-6">
                  <div className="form-floating">
                    <select
                      className="form-select themed-input"
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <label htmlFor="gender">Gender</label>
                  </div>
                </div>

                {/* Profile Photo */}
                <div className="col-md-12">
                  <label className="form-label" style={{ color: "#198754", fontWeight: "600" }}>
                    Profile Photo
                  </label>

                  {/* Show upload only if NOT google login */}
                  {user?.login_method !== "google" ? (
                    <input
                      type="file"
                      className="form-control themed-input"
                      name="profile_image"
                      onChange={handleChange}
                    />
                  ) : null}

                  {preview && (
                    <img
                      src={preview}
                      alt="preview"
                      className="mt-2 rounded"
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "12px",
                        border: "1px solid #f1e6d4",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer justify-content-center">
              <button
                type="button"
                className="btn-themed"
                data-bs-dismiss="modal"
                onClick={resetForm}
              >
                Close
              </button>
              <button type="submit" className="btn-themed">
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .themed-input {
          border-radius: 10px;
          border: 1px solid #f1e6d4;
          background: #fffaf4;
          color: #000000ff;
          font-size: 1rem;
          transition: border-color 0.3s ease;
          box-shadow: none;
        }
        .themed-input:focus {
          border-color: #198754;
          background: #fff;
          outline: none;
          box-shadow: 0 0 5px rgba(122, 86, 58, 0.4);
        }
        .profile-form .form-floating > label {
          color: #000000ff;
          font-weight: 600;
        }
        .btn-themed {
          background-color: #198754;
          color: #fff;
          border-radius: 25px;
          border: none;
          padding: 8px 26px;
          font-weight: 500;
          transition: background-color 0.3s ease;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(122, 86, 58, 0.12);
        }
        .btn-themed:hover {
          background-color: #198754;
        }
        .btn-themed:focus, .btn-themed:active {
          background-color: #198754;
          outline: none;
          box-shadow: 0 0 7px rgba(122, 86, 58, 0.5);
        }
      `}</style>
    </div>
  );
};

export default ProfileUpdateForm;
