import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api.js";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";


export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const res = await API.post("/api/auth/login", {
        email: username,
        password,
      });

      const data = res.data.data;
	  
	  if (remember) {
		  sessionStorage.removeItem("accessToken");
		  sessionStorage.removeItem("refreshToken");
		  sessionStorage.removeItem("user");

		  localStorage.setItem("accessToken", data.token.accessToken);
		  localStorage.setItem("refreshToken", data.token.refreshToken);
		  localStorage.setItem("user", JSON.stringify(data));
		} else {
		  localStorage.removeItem("accessToken");
		  localStorage.removeItem("refreshToken");
		  localStorage.removeItem("user");

		  sessionStorage.setItem("accessToken", data.token.accessToken);
		  sessionStorage.setItem("refreshToken", data.token.refreshToken);
		  sessionStorage.setItem("user", JSON.stringify(data));
		}

      setUser(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo / Title */}
        <div className="text-center mb-2">
          <img src="/logo.png" height={60} alt="logo" />
          <h4 className="mt-2">Welcome Back</h4>
          <small className="text-muted">Login to your account</small>
        </div>

        {/* Error */}
        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleLogin}>

          {/* Email */}
          <input
            className="form-control mb-3"
            placeholder="Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          {/* Password with toggle */}
          <div className="position-relative mb-2">
            <input
              type={showPwd ? "text" : "password"}
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="pwd-toggle"
              onClick={() => setShowPwd((p) => !p)}
            >
              {showPwd ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Remember + Forgot */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember((p) => !p)}
              />{" "}
              <small>Remember me</small>
            </div>

            <Link to="/forgot-password" className="small text-decoration-none">
              Forgot password?
            </Link>
          </div>

          {/* Button */}
          <button
            className="btn btn-primary w-100 login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}