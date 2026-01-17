import React from "react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar as RBNavbar, Nav, Container, Badge, Fade } from "react-bootstrap";
import "./Navbar.css";
import API from "../api/api";
import useNotifications from "../hooks/useNotifications";
import NotificationBell from "./NotificationBell";
import NotificationDropdown from "./NotificationDropdown";
import listenForForegroundMessages from "../firebase/firebaseMessaging";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const {
    unreadCount,
    notifications,
    loadNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications(user);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const mountedRef = useRef(false);
  const id = user?.token?.userId;

    /* ---------------- Reset on Auth Change ---------------- */
	useEffect(() => {
	  // Ensure menus are closed when user logs in or out
	  setShowProfile(false);
	  setShowNotifications(false);
	}, [user]);

  /* ---------------- Click outside / ESC ---------------- */
  useEffect(() => {
	  const handler = (e) => {
		

		if (
		  notificationRef.current &&
		  !notificationRef.current.contains(e.target)
		) {
		  setShowNotifications(false);
		}

		if (
		  profileRef.current &&
		  !profileRef.current.contains(e.target)
		) {
		  setShowProfile(false);
		  
		}

	  };

	  const esc = (e) => {
		if (e.key === "Escape") {
		  setShowNotifications(false);
		  setShowProfile(false);
		}
	  };

	  document.addEventListener("mousedown", handler);
	  document.addEventListener("keydown", esc);

	  return () => {
		document.removeEventListener("mousedown", handler);
		document.removeEventListener("keydown", esc);
	  };
	}, []);


  /* ---------------- Firebase (optional) ---------------- */
  useEffect(() => {
    if (!user) return;

    listenForForegroundMessages(() => {

	})
      .catch(() => setNotificationsEnabled(false));
  }, [user]);

  /* ---------------- Logout ---------------- */
  const handleLogout = async () => {
    try {
      await API.post("/logout", {}, {
        headers: { Authorization: `Bearer ${user.token.accessToken}` }
      });
    } catch (e) {
      console.warn("Logout failed", e);
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  const email = user?.token?.email;

  return (
    <RBNavbar expand="lg" className="px-4" style={{ backgroundColor: "hsl(270, 70%, 40%)" }}>
      <Container fluid>
        <RBNavbar.Brand className="text-white">
          <img src="/logo.png" width={50} className="me-2" />
          Diamond Realty
        </RBNavbar.Brand>

        <Nav className="ms-auto align-items-center gap-4">

          {/* -------- Logged OUT -------- */}
          {!user && (
            <>
              <Link to="/login" className="text-white text-decoration-none">
                Sign In
              </Link>
            </>
          )}

          {/* -------- Logged IN -------- */}
          {user && (
            <>
              <Link to="/dashboard" className="text-white text-decoration-none">
                Dashboard
              </Link>
			  
			  <Link to="/" className="text-white text-decoration-none">
                Home
              </Link>

              {/* 🔔 Notifications */}
              <div ref={notificationRef} className="position-relative">
                <button
                  className="btn btn-link text-white p-0"
                  disabled={!notificationsEnabled}
                  onClick={() => {
                    loadNotifications();
                    setShowNotifications((p) => !p);
                    setShowProfile(false);
                  }}
                >
                  <NotificationBell unreadCount={unreadCount} />
                  {unreadCount > 0 && (
                    <Badge bg="danger" pill className="position-absolute top-0 start-100">
                      {unreadCount}
                    </Badge>
                  )}
                </button>

                {showNotifications && (
                  <Fade in>
                    <div className="dropdown-menu dropdown-menu-end mt-2" style={{ minWidth: 340 }}>
                      <div className="px-3 py-2 d-flex justify-content-between">
                        <strong>Notifications</strong>
                        <button className="btn btn-sm btn-link" onClick={markAllAsRead}>
                          Mark all
                        </button>
                      </div>
                      <NotificationDropdown
                        notifications={notifications}
                        onRead={markAsRead}
                      />
                    </div>
                  </Fade>
                )}
              </div>

              {/* 👤 Profile */}
              <div ref={profileRef} className="position-relative">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowProfile((p) => !p);
                    setShowNotifications(false);
                  }}
                >
                  <span className="text-truncate" style={{ maxWidth: 160 }}>
					{email}
				  </span>

				  <img
					src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
					  email || "user"
					)}&background=6f42c1&color=fff`}
					alt="avatar"
					className="rounded-circle"
					width={32}
					height={32}
				  />
                </button>

                {showProfile && (
				  <Fade in={showProfile} mountOnEnter unmountOnExit appear={false}>
					<ul className="profile-menu" hidden={!showProfile}>
					  <li>
						<Link className="profile-item" to={`/profile/${id}`}>
						  Profile
						</Link>
					  </li>
					  <li><hr className="profile-divider" />Change Password</li>
					  <li>
						<button
						  className="profile-item danger"
						  onClick={handleLogout}
						>
						  Logout
						</button>
					  </li>
					</ul>
				  </Fade>
				)}

              </div>
            </>
          )}
        </Nav>
      </Container>
    </RBNavbar>
  );
}
