import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import zxcvbn from "zxcvbn";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  
  const getStrength = (pwd) => {
	  if (!pwd) return null;
	  return zxcvbn(pwd);
	};

  const strength = getStrength(password);

  const handleSubmit = async (e) => {
	  e.preventDefault();

	  if (password !== confirm) {
		return setMsg("Passwords do not match");
	  }

	  try {
		setLoading(true);

		const res = await API.post("/api/auth/reset-password", {
		  token,
		  newPassword: password
		});

		const data = res.data.data;

		// ✅ Save tokens (same as login)
		localStorage.setItem("accessToken", data.accessToken);
		localStorage.setItem("refreshToken", data.refreshToken);
		localStorage.setItem("user", JSON.stringify(data));

		setMsg("Password reset successful 🎉");

		setTimeout(() => {
		  navigate("/dashboard"); // 🚀 directly go inside app
		}, 1000);

	  } catch (err) {
		setMsg(err.response?.data?.message || "Invalid or expired link");
	  } finally {
		setLoading(false);
	  }
	};

  if (!token) {
    return <p className="text-center mt-5">Invalid reset link</p>;
  }

  return (
    <div className="login-page">
      <div className="login-card">

        <h4 className="mb-3">Reset Password</h4>

        {msg && <div className="alert alert-info">{msg}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="form-control mb-2"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            className="form-control mb-3"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
		  
		  {strength && (
			  <div className="mb-2">
				<div className="progress" style={{ height: "6px" }}>
				  <div
					className={`progress-bar strength-${strength.score}`}
					style={{ width: `${(strength.score + 1) * 20}%` }}
				  />
				</div>

				<small className="text-muted">
				  {["Very Weak", "Weak", "Fair", "Good", "Strong"][strength.score]}
				</small>
			  </div>
			)}

          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}