import React from "react";
import "./RightDrawer.css";

export default function RightDrawer({
  open,
  title,
  onClose,
  children,
  width = "600px",
}) {
  return (
    <>
      {open && <div className="drawer-backdrop" onClick={onClose} />}

      <div
        className={`right-drawer ${open ? "open" : ""}`}
        style={{ width }}
      >
        <div className="drawer-header">
          <h5 className="m-0">{title}</h5>
          <button className="btn-close" onClick={onClose} />
        </div>

        <div className="drawer-body">{children}</div>
      </div>
    </>
  );
}
