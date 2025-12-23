import React, { useEffect, useState } from "react";
import { Table, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import API from "../../api/API";
import { useToast } from "../../components/common/ToastProvider";

export default function SiteVisitPayment({ siteVisitId, stakeHolderId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const [summary, setSummary] = useState({});
  const [payments, setPayments] = useState([]);

  const [payment, setPayment] = useState({
    amount: "",
    mode: "CASH",
    remarks: "",
	stakeHolderId: stakeHolderId
  });

  useEffect(() => {
    load();
  }, [siteVisitId]);
  
  
  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/api/site-visits/${siteVisitId}/payments`);
      setSummary(res.data.summary);
      setPayments(res.data.payments);
    } catch {
      setError("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const addPayment = async (e) => {
	  e.preventDefault();
    if (!payment.amount || payment.amount <= 0) {
		showToast("Invalid payment amount", "danger");
		return;
	}
	console.log("payment.stakeHolderId: "+stakeHolderId);
	if (!payment.stakeHolderId) {
		showToast("Stakeholder not found", "danger");
		return;
	}

    setLoading(true);
    try {
      await API.post(`/api/site-visits/${siteVisitId}/payments`, 
		  {
		  userId: payment.stakeHolderId,
		  amount: payment.amount,
		  paymentMode: payment.mode,
		  remarks: payment.remarks
		  }
	  );
	  showToast("Payment recorded successfully");
      setPayment({ amount: "", mode: "CASH", remarks: "", stakeHolderId });
	  onClose();
      load();
	  
    } catch {
      showToast("Payment failed", "danger");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <>
      

      <Row className="mb-3">
        <Col><b>Total Expense:</b> {summary.totalExpense}</Col>
        <Col><b>Paid:</b> {summary.totalPaid}</Col>
        <Col><b>Balance:</b> {summary.balance}</Col>
      </Row>

      <Form className="mb-3" onSubmit={addPayment}>
        <Row>
          <Col md={4}>
            <Form.Control
              type="number"
              name="amount"
              placeholder="Amount"
              value={payment.amount}
              onChange={handleChange}
            />
          </Col>

          <Col md={4}>
            <Form.Select
              name="mode"
              value={payment.paymentMode}
              onChange={handleChange}
            >
              <option>CASH</option>
              <option>UPI</option>
              <option>BANK</option>
            </Form.Select>
          </Col>
        </Row>
		<Row className="mt-2">
		  <Col>
			<Form.Control
			  as="textarea"
			  rows={2}
			  name="remarks"
			  placeholder="Remarks (optional)"
			  value={payment.remarks}
			  onChange={handleChange}
			/>
		  </Col>
		  <Col md={4}>
            <Button type="submit">Payment</Button>
          </Col>
		</Row>

      </Form>

      <Table size="sm" bordered>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Mode</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.paymentId}>
              <td>{p.paymentDate}</td>
              <td>{p.amount}</td>
              <td>{p.paymentMode}</td>
              <td>{p.remarks}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="text-end">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </>
  );
}
