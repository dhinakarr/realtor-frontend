import React from "react";
import { Offcanvas } from "react-bootstrap";
import UserCreatePage from "./UserCreatePage";
import "./UserCreateOverlay.css";

export default function UserCreateOverlay({ show, onClose, onSuccess }) {
  return (
    <Offcanvas
      show={show}
      onHide={onClose}
      placement="end"          // 👉 slides from right
      backdrop="static"
      className="user-offcanvas"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Create User</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="p-0">
        <UserCreatePage
          isOverlay
          onSuccess={() => {
            onSuccess?.();
            onClose();
          }}
        />
      </Offcanvas.Body>
    </Offcanvas>
  );
}
