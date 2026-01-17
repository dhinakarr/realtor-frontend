import React from "react";
import { Offcanvas } from "react-bootstrap";
import ReceivePaymentForm from "./ReceivePaymentForm";
import PayCommissionForm from "./PayCommissionForm";
import "./PaymentDrawer.css";

const PaymentDrawer = ({ open, onClose, row, action, onSuccess }) => {
	if (!row) return null;

	const title =
		action === "RECEIVE"
			? "Receive Payment"
			: action === "PAY_COMMISSION"
			? "Pay Commission"
			: "Payment";

	return (
		<Offcanvas show={open} onHide={onClose} placement="end" className="payment-drawer">
			<Offcanvas.Header closeButton>
				<Offcanvas.Title>{title}</Offcanvas.Title>
			</Offcanvas.Header>

			<Offcanvas.Body>
				{action === "RECEIVE" && (
					<ReceivePaymentForm
						row={row}
						onCancel={onClose}
						onSuccess={onSuccess}
					/>
				)}

				{action === "PAY_COMMISSION" && (
					<PayCommissionForm
						row={row}
						onCancel={onClose}
						onSuccess={onSuccess}
					/>
				)}
			</Offcanvas.Body>
		</Offcanvas>
	);
};

export default PaymentDrawer;
