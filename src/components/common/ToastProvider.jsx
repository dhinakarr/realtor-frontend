import React, { createContext, useContext, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
	const [toasts, setToasts] = useState([]);

	const normalizeVariant = (variant) => {
	  if (variant === "danger") return "warning";
	  if (variant === "error") return "warning";
	  return variant;
	};

	const showToast = (message, variant = "success") => {
	  const id = Date.now();
	  setToasts((prev) => [
		...prev,
		{ id, message, variant: normalizeVariant(variant) }
	  ]);

	  setTimeout(() => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	  }, 4000);
	};


	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}

			<ToastContainer
				  className="p-3"
				  style={{
					position: "fixed",
					top: "50%",
					right: "16px",
					transform: "translateY(-50%)",
					zIndex: 10000,
				  }}
				>
				{toasts.map((t) => (
					<Toast
					  key={t.id}
					  bg={t.variant}
					  animation
					  delay={4000}
					  autohide
					>
					  <Toast.Body className="text-white fw-semibold">
						{t.message}
					  </Toast.Body>
					</Toast>

				))}
			</ToastContainer>
		</ToastContext.Provider>
	);
};

export const useToast = () => useContext(ToastContext);
