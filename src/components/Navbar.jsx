// components/Navbar.jsx
import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown } from 'bootstrap';
import API from "../api/api.js";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const btnRef = useRef(null);
  const dropdownInstanceRef = useRef(null);
  
  useEffect(() => {
    if (btnRef.current && !dropdownInstanceRef.current) {
		dropdownInstanceRef.current = new Dropdown(btnRef.current); 
	}
    return () => {
      if (dropdownInstanceRef.current) {
        dropdownInstanceRef.current.dispose();
        dropdownInstanceRef.current = null;
      }
    };
  }, [user]);
  
  useEffect(() => {
	  if (!localStorage.getItem("user")) {
		navigate("/");
	  }
	}, []);

  const handleLogout = async () => {
    try {
      const refreshToken = user?.token?.refreshToken;
      if (refreshToken) {
        await API.post(
          "/logout",
          {},
          { headers: { Authorization: `Bearer ${user.token.accessToken}` } }
        );
      }
      localStorage.clear();
	  localStorage.removeItem("user");
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/");
    }
  };
  
  const handleDropdownToggle = () => {
    if (dropdownInstanceRef.current) {
      dropdownInstanceRef.current.toggle();
    }
  };

  const email = user?.token?.email;

  return (
    <nav
      className="d-flex justify-content-between align-items-center px-4 py-2"
      style={{ backgroundColor: "hsl(270, 70%, 40%)" }}
    >
      <div className="d-flex align-items-center">
        <img
          src="/logo192.png"
          alt="Logo"
          style={{ width: "40px", marginRight: "10px" }}
        />
        <h4 className="m-0 text-white">Diamond Realtors</h4>
      </div>

      <div className="d-flex align-items-center">
        {user ? (
          <div className="dropdown">
            {/* NOTE: removed data-bs-toggle attribute to avoid auto-init conflict */}
            <button
			  ref={btnRef}
              className="btn btn-secondary dropdown-toggle d-flex align-items-center"
              type="button"
              id="dropdownMenuButton"
			  data-bs-toggle="dropdown"
              aria-expanded="false"
			  onClick={handleDropdownToggle}
            >
              <span className="me-2">{email}</span>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  email || "user"
                )}`}
                alt="avatar"
                className="rounded-circle"
                style={{ width: "35px", height: "35px" }}
              />
            </button>

            <ul
              className="dropdown-menu dropdown-menu-end"
              aria-labelledby="dropdownMenuButton"
            >
              <li>
                <Link className="dropdown-item" to="/profile">
                  User Profile
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/change-password">
                  Change Password
                </Link>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
