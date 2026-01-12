import React, { useState } from "react";
import { FaBell } from "react-icons/fa";

export default function NotificationBell({ unreadCount, onClick }) {
  return (
    <div className="position-relative me-3" style={{ cursor: "pointer" }} onClick={onClick}>
      <FaBell size={20} color="white" />
      {unreadCount > 0 && (
        <span
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
        >
          {unreadCount}
        </span>
      )}
    </div>
  );
}
