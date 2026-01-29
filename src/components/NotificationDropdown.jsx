import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotificationDropdown({ notifications, onRead, onClose  }) {
	const navigate = useNavigate();
	//console.log("NotificationDropdown notifications: "+JSON.stringify(notifications));
  const handleClick = (n) => {
    onRead(n.id);
	onClose();
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
          onClick={(e) => {
			e.stopPropagation();
			handleClick(n);
		  }}
		  style={{
			cursor: "pointer",
			whiteSpace: "normal",
			wordBreak: "break-word",
			overflowWrap: "anywhere"
		  }}
        >
          <div>{n.title}</div>
          <small className="text-muted">{n.message}</small>
        </div>
      ))}
    </>
  );
}
