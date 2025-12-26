import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api.js";

export default function EditProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await API.get(`/api/users/${userId}`);
      setForm(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await API.put(`/api/users/${userId}`, form);
      navigate(`/profile/${userId}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h4 className="mb-4 text-center">Edit Profile</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input type="text" className="form-control" name="fullName" value={form.fullName} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" disabled className="form-control" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input type="text" className="form-control" name="mobile" value={form.mobile} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Address</label>
                <textarea className="form-control" name="address" value={form.address} onChange={handleChange}></textarea>
              </div>
              <button type="submit" className="btn btn-success w-100">Save Changes</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
