import React, { useState } from "react";
import API from "../api/api";
import { useToast } from "../components/common/ToastProvider";

export default function ChangePasswordModal({ show, onClose }) {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  if (!show) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.oldPassword || !form.newPassword) {
      setError("All fields are required");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await API.post("/api/auth/change-password",
        {
          oldPassword: form.oldPassword,
          newPassword: form.newPassword
        }
      );

      showToast("Password changed successfully ✅", "success");
      onClose();
    } catch (err) {
      showToast(err, "danger");
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-box">
        <h5 className="mb-3">Change Password</h5>

        <input
          type="password"
          name="oldPassword"
          placeholder="Old Password"
          className="form-control mb-2"
          value={form.oldPassword}
          onChange={handleChange}
        />

        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          className="form-control mb-2"
          value={form.newPassword}
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className="form-control mb-2"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        {error && <div className="text-danger small mb-2">{error}</div>}

        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}