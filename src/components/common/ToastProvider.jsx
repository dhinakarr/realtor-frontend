import React, { createContext, useContext, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
	const [toasts, setToasts] = useState([]);

	const showToast = (message, variant = "success") => {
		const id = Date.now();
		setToasts((prev) => [...prev, { id, message, variant }]);

		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 4000);
	};

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}

			<ToastContainer position="top-end" className="p-3">
				{toasts.map((t) => (
					<Toast key={t.id} bg={t.variant}>
						<Toast.Body className="text-white">
							{t.message}
						</Toast.Body>
					</Toast>
				))}
			</ToastContainer>
		</ToastContext.Provider>
	);
};

export const useToast = () => useContext(ToastContext);
