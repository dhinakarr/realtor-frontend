import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import API from "../../api/api";
import { useToast } from "../common/ToastProvider";

const PayCommissionForm = ({ row, onCancel, onSuccess }) => {
	const [amount, setAmount] = useState(row.amount || "");
	const [mode, setMode] = useState("BANK");
	const [remarks, setRemarks] = useState("");
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const isInvalid = loading || amount <= 0 || amount > row.amount;
	const { showToast } = useToast();

	const submit = async () => {
		if (!amount || amount <= 0) {
			setError("Amount must be greater than zero");
			return;
		}
		if (amount > row.amount) {
			setError("Amount exceeds payable commission");
			return;
		}

		try {
			setLoading(true);
			setError(null);

			await API.post("/api/payments", {
				paymentType: "PAID",
				plotId: row.plotId,
				saleId: row.saleId,
				paidTo: row.agentId,
				amount,
				paymentMode: mode,
				remarks,
			});
			showToast("Commission paid successfully", "success");
			onSuccess?.();
			onCancel();
		} catch (e) {
			showToast(
				e.response?.data?.message || "Failed to pay commission",
				"danger"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Form>
			<p className="text-muted">
				<strong>Agent:</strong> {row.agentName}
			</p>

			<Form.Group className="mb-3">
				<Form.Label>Amount</Form.Label>
				<Form.Control
					type="number"
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
				/>
			</Form.Group>

			<Form.Group className="mb-3">
				<Form.Label>Payment Mode</Form.Label>
				<Form.Select value={mode} onChange={(e) => setMode(e.target.value)}>
					<option value="BANK">Bank Transfer</option>
					<option value="UPI">UPI</option>
					<option value="CASH">Cash</option>
					<option value="Cheque">Cheque</option>
					<option value="DD">DD</option>
				</Form.Select>
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
				<Button variant="danger" disabled={isInvalid} onClick={submit}>
					Pay
				</Button>
			</div>
		</Form>
	);
};

export default PayCommissionForm;
