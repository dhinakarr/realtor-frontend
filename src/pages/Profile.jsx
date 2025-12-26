import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api.js";

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await API.get(`/api/users/${userId}`);
      setUser(res.data.data);
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "70vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <p className="text-center mt-5">User not found</p>;
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                alt="Profile"
                className="rounded-circle mb-3"
                style={{ width: "120px", height: "120px", objectFit: "cover" }}
              />
              <h3 className="card-title">{user.fullName}</h3>
              <p className="text-muted">{user.email}</p>
              {user.mobile && <p className="mb-1"><strong>Phone:</strong> {user.mobile}</p>}
              {user.address && <p className="mb-1"><strong>Address:</strong> {user.address}</p>}
              <button
                className="btn btn-primary mt-3"
                onClick={() => navigate(`/profile/edit/${userId}`)}
              >
                Edit Profile
              </button>
            </div>
          </div>			
        </div>
      </div>
    </div>
  );
}
