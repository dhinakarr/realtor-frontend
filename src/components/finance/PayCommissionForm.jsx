import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Row, Col, Table } from "react-bootstrap";
import API from "../../api/api";
import { useToast } from "../common/ToastProvider";

const PayCommissionForm = ({ row, onCancel, onSuccess }) => {
	const [amount, setAmount] = useState(row.amount || "");
	const [mode, setMode] = useState("BANK");
	const [remarks, setRemarks] = useState("");
	const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const isInvalid = loading || amount <= 0 || amount > row.amount;
	const [history, setHistory] = useState([]);
	const { showToast } = useToast();

	const toLocalDateTime = (date) => `${date}T00:00:00`;

	/** Load payment history */
	  useEffect(() => {
		  if (!row?.saleId) {
			showToast("Missing Plot id, transaction history not available", "danger");  
			return;
		  }

		API.get(`/api/payments/sale/${row.saleId}/list`)
		  .then((res) => {
			const data = res.data?.data || [];
			setHistory(data)
		  }
		  )
		  .catch(() => setHistory([]));
	  }, [row.saleId]);

	const submit = async () => {
		if (!amount || amount <= 0) {
			showToast("Amount must be greater than zero", "danger");
			return;
		}
		if (amount > row.commissionPayable) {
			showToast("Amount exceeds payable commission", "danger");
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
				paymentDate: toLocalDateTime(paymentDate),
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
	
	const paidHistory = history.filter(
	  (t) =>
		t.paymentType === "PAID" &&
		String(t.paidTo) === String(row.agentId)
	);
	
	const totalPaid = paidHistory.reduce((sum, t) => {
		  if (
			t?.paymentType === "PAID" &&
			t?.paidTo === row.agentId
		  ) {
			return sum + Number(t.amount || 0);
		  }
		  return sum;
		}, 0);
	
	const formatDate = (iso) => {
	  if (!iso) return "-";
	  const d = new Date(iso);
	  return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
	};
	
	const formatted = Number(row.commissionPayable).toLocaleString("en-IN", {
		  style: "currency",
		  currency: "INR",
		  minimumFractionDigits: 2,
		  maximumFractionDigits: 2,
		});

	return (
	  <>
		{/* Agent Summary */}
		<div className="mb-2 g-1">
		  <strong>Agent:</strong> {row.agentName}
		  <div className="text-muted small mt-1">
			<span className="me-3">
			  Commission Paid: ₹{totalPaid}
			</span>
			<span>
			  Outstanding: <strong>₹{formatted}</strong>
			</span>
		  </div>
		</div>

		{/* Form */}
		<Form>
		  <Row className="g-2 mb-2">
			<Col md={6}>
			  <Form.Group>
				<Form.Label>Amount</Form.Label>
				<Form.Control
				  type="number"
				  value={amount}
				  onChange={(e) => setAmount(e.target.value)}
				/>
			  </Form.Group>
			</Col>

			<Col md={6}>
			  <Form.Group>
				<Form.Label>Payment Date</Form.Label>
				<Form.Control
				  type="date"
				  value={paymentDate}
				  onChange={(e) => setPaymentDate(e.target.value)}
				/>
			  </Form.Group>
			</Col>
		  </Row>

		  <Row className="g-2 mb-2">
			<Col md={6}>
			  <Form.Group>
				<Form.Label>Payment Mode</Form.Label>
				<Form.Select
				  value={mode}
				  onChange={(e) => setMode(e.target.value)}
				>
				  <option value="BANK">Bank Transfer</option>
				  <option value="UPI">UPI</option>
				  <option value="CASH">Cash</option>
				  <option value="CHEQUE">Cheque</option>
				  <option value="DD">DD</option>
				</Form.Select>
			  </Form.Group>
			</Col>

			<Col md={6}>
			  <Form.Group>
				<Form.Label>Remarks</Form.Label>
				<Form.Control
				  as="textarea"
				  rows={2}
				  value={remarks}
				  onChange={(e) => setRemarks(e.target.value)}
				/>
			  </Form.Group>
			</Col>
		  </Row>

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

		{/* Transaction History */}
		 <h6 className="mt-3">Commission Payment History</h6>

			{paidHistory.length === 0 ? (
			  <div className="text-muted small">No commission payments found.</div>
			) : (
			  <Table size="sm" bordered hover>
				<thead>
				  <tr>
					<th>Date</th>
					<th>Mode</th>
					<th>Remarks</th>
					<th>Amount</th>
				  </tr>
				</thead>
				<tbody>
				  {paidHistory.map((h) => (
					<tr key={h.paymentId}>
					  <td>{formatDate(h.paymentDate)}</td>
					  <td>{h.paymentMode}</td>
					  <td>{h.remarks}</td>
					  <td>₹{h.amount}</td>
					</tr>
				  ))}
				</tbody>
			  </Table>
			)}

		
	  </>
	);

};

export default PayCommissionForm;
