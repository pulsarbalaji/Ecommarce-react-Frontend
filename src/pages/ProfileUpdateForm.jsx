import React, { useState, useEffect, useContext } from "react";
import api from "../utils/base_url";
import { AuthContext } from "../context/AuthContext";

const ProfileUpdateForm = () => {
  const { userId } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    full_name: "",
    address: "",
    date_of_birth: "",
    gender: "",
    profile_photo: null,
  });
  const [preview, setPreview] = useState(null);

  // Fetch profile
  useEffect(() => {
    if (userId) {
      api.get(`/profile/${userId}/`).then((res) => {
        const data = res.data;
        setFormData({
          full_name: data.full_name || "",
          address: data.address || "",
          date_of_birth: data.date_of_birth || "",
          gender: data.gender || "",
          profile_photo: null,
        });
        if (data.profile_photo) {
          setPreview(`http://127.0.0.1:8000${data.profile_photo}`);
        }
      });
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_photo" && files?.[0]) {
      setFormData({ ...formData, profile_photo: files[0] });
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

    await api.put(`/profile/${userId}/`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("Profile updated successfully!");
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
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title ">Update Profile</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              <div className="row g-3">
                {/* Full Name */}
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control"
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
                      className="form-control"
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
                      className="form-control"
                      id="dob"
                      name="date_of_birth"
                      value={formData.date_of_birth}
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
                      className="form-select"
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
                  <label className="form-label">Profile Photo</label>
                  <input
                    type="file"
                    className="form-control"
                    name="profile_photo"
                    onChange={handleChange}
                  />
                  {preview && (
                    <img
                      src={preview}
                      alt="preview"
                      className="mt-2 rounded"
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer justify-content-center">
              <button
                type="button"
                className="btn btn-dark"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button type="submit" className="btn btn-dark">
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdateForm;
