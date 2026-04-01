import React, { useState } from "react";
import API from "../api/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/api/auth/forgot-password", { email });
      setMsg("Reset link sent to your email");
    } catch {
      setMsg("Something went wrong");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h5>Forgot Password</h5>

        <form onSubmit={handleSubmit}>
          <input
            className="form-control mb-3"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="btn btn-primary w-100">
            Send Reset Link
          </button>
        </form>

        {msg && <p className="mt-3 small">{msg}</p>}
      </div>
    </div>
  );
}