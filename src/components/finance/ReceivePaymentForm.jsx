import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import API from "../../api/api";
import { useToast } from "../common/ToastProvider";

const ReceivePaymentForm = ({ row, onCancel, onSuccess }) => {
	const [amount, setAmount] = useState(row.amount || "");
	const [mode, setMode] = useState("CASH");
	const [ref, setRef] = useState("");
	const [remarks, setRemarks] = useState("");
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const maxAmount = row.outstanding;
	const isInvalid = loading || amount <= 0 || amount > row.outstanding;
	const { showToast } = useToast();
	
	const submit = async () => {
		if (!amount || amount <= 0) {
			setError("Amount must be greater than zero");
			return;
		}
		if (amount > row.outstanding) {
			setError("Amount exceeds outstanding balance");
			return;
		}

		try {
			setLoading(true);
			setError(null);

			await API.post("/payments", {
				paymentType: "RECEIVED",
				plotId: row.plotId,
				amount,
				paymentMode: mode,
				transactionRef: ref,
				remarks,
			});
			showToast("Payment received successfully", "success");
			onSuccess?.();
			onCancel();
		} catch (e) {
			showToast(
				e.response?.data?.message || "Failed to receive payment",
				"danger"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Form>
			<p className="text-muted">
				<strong>Plot:</strong> {row.plotNo}
			</p>

			<Form.Group className="mb-3">
				<Form.Label>Amount</Form.Label>
				<Form.Control
					type="number"
					max={maxAmount}
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
				/>
				<Form.Text className="text-muted">
					Max receivable: ₹ {maxAmount?.toLocaleString()}
				</Form.Text>
			</Form.Group>

			<Form.Group className="mb-3">
				<Form.Label>Payment Mode</Form.Label>
				<Form.Select value={mode} onChange={(e) => setMode(e.target.value)}>
					<option value="CASH">Cash</option>
					<option value="UPI">UPI</option>
					<option value="BANK">Bank Transfer</option>
					<option value="CHEQUE">Cheque</option>
				</Form.Select>
			</Form.Group>

			<Form.Group className="mb-3">
				<Form.Label>Transaction Ref</Form.Label>
				<Form.Control
					value={ref}
					onChange={(e) => setRef(e.target.value)}
				/>
			</Form.Group>

			<Form.Group className="mb-3">
				<Form.Label>Remarks</Form.Label>
				<Form.Control
					as="textarea"
					rows={2}
					value={remarks}
					onChange={(e) => setRemarks(e.target.value)}
				/>
			</Form.Group>

			{error && <Alert variant="danger">{error}</Alert>}

			<div className="d-flex justify-content-end gap-2">
				<Button variant="secondary" onClick={onCancel}>
					Cancel
				</Button>
				<Button variant="success" onClick={submit} disabled={isInvalid}>
					Receive
				</Button>
			</div>
		</Form>
	);
};

export default ReceivePaymentForm;
