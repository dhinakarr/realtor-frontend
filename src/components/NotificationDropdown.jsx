import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotificationDropdown({ notifications, onRead }) {
	const navigate = useNavigate();
	
  const handleClick = (n) => {
    onRead(n.id);
    if (n.redirectUrl) {
      navigate(n.redirectUrl);
    }
  };

  return (
    <>
      {notifications.length === 0 && (
        <div className="text-muted text-center py-2">
          No notifications
        </div>
      )}

      {notifications.map((n) => (
        <div
          key={n.id}
          className={`dropdown-item ${!n.read ? "fw-bold" : ""}`}
          onClick={() => handleClick(n)}
          style={{ cursor: "pointer" }}
        >
          <div>{n.title}</div>
          <small className="text-muted">{n.body}</small>
        </div>
      ))}
    </>
  );
}
