import { useState, useEffect } from "react";
import "./PaymentModal.css";
import API from "../api/api";

export default function PaymentModal({ open, onClose, plotId, outstandingAmount, onSubmit }) {
	const [errors, setErrors] = useState({});
	const [transactions, setTransactions] = useState([]);
	const [loadingTxns, setLoadingTxns] = useState(false);

	
  const [form, setForm] = useState({
    paymentType: "RECEIVED",
    amount: "",	
	paymentDate: new Date().toISOString().slice(0, 10),
    paymentMode: "CASH",
    transactionRef: "",
    remarks: "",
  });

  
  useEffect(() => {
	  if (!open) return;
		setForm({
		  paymentType: "RECEIVED",
		  amount: "",
		  paymentDate: new Date().toISOString().slice(0, 10),
		  paymentMode: "CASH",
		  transactionRef: "",
		  remarks: ""
		});
		setErrors({});
	}, [open]);

	useEffect(() => {
	  if (!open || !plotId) return;

	  const loadTransactions = async () => {
		try {
		  setLoadingTxns(true);
		  const res = await API.get(`/api/payments/plot/${plotId}`);
		  setTransactions(res.data?.data || []);
		} catch (err) {
		  console.error("Failed to load transactions", err);
		} finally {
		  setLoadingTxns(false);
		}
	  };

	  loadTransactions();
	  console.log("transactions: "+JSON.stringify(transactions));
	}, [open, plotId]);
	

	const totalReceived = transactions
	  .filter(t => t.paymentType === "RECEIVED")
	  .reduce((s, t) => s + Number(t.amount), 0);

	const receivedTransactions = transactions.filter(t => t.paymentType === "RECEIVED");

  const validate = () => {
	  const newErrors = {};
	  const amount = Number(form.amount);
	  
	  if (!amount || amount <= 0) {
		  newErrors.amount = "Amount must be greater than 0";
		} else if (amount > outstandingAmount) {
		  newErrors.amount = `Amount cannot exceed outstanding (${outstandingAmount})`;
		}

	  if (!form.paymentType) {
		newErrors.paymentType = "Payment type is required";
	  }

	  if (!form.paymentMode) {
		newErrors.paymentMode = "Payment mode is required";
	  }

	  if (!form.paymentDate) {
		  newErrors.paymentDate = "Payment date is required";
		}

	  setErrors(newErrors);
	  return Object.keys(newErrors).length === 0;
	};


  const handleChange = (e) => {
	  
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
	setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = () => {
	  if (!validate()) return;
	  //console.log("@PaymentModal plotId: "+plotId);
    onSubmit({
      plotId,
      ...form,
      amount: Number(form.amount),
    });
  };
  
  const formatDate = (iso) => {
	  if (!iso) return "-";
	  const d = new Date(iso);
	  return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
	};

  if (!open) return null;
	
  return (
    <div className="payment-overlay" onClick={onClose}>
      <div className="payment-drawer" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="payment-header">
          <div>
            <h5>Add Payment</h5>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
		

        {/* Body */}
        
		<div className="payment-body grid-2">
		  <div className="text-muted mt-1">
			  Total received: {totalReceived}
		  </div>
		  <div className="text-muted mt-1">
			  OutStanding: <strong>{outstandingAmount}</strong>
		  </div>

          <div className="form-group">
            <label>Payment Type</label>
            <select
              name="paymentType"
              value={form.paymentType}
              onChange={handleChange}
              className={`form-control ${errors.paymentType ? "is-invalid" : ""}`}
            >
              <option value="RECEIVED">Received</option>
              <option value="PAID">Paid</option>
            </select>
          </div>

          <div className="form-group">
            <label>Payment Date</label>
            <input
              type="date"
              name="paymentDate"
              value={form.paymentDate}
              onChange={handleChange}
              className={`form-control ${errors.paymentDate ? "is-invalid" : ""}`}
            />
            {errors.paymentDate && <div className="invalid-feedback">{errors.paymentDate}</div>}
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className={`form-control ${errors.amount ? "is-invalid" : ""}`}
            />
            {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
          </div>

          <div className="form-group">
            <label>Payment Mode</label>
            <select
              name="paymentMode"
              value={form.paymentMode}
              onChange={handleChange}
              className={`form-control ${errors.paymentMode ? "is-invalid" : ""}`}
            >
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
              <option value="DD">DD</option>
              <option value="UPI">UPI</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
            {errors.paymentMode && <div className="invalid-feedback">{errors.paymentMode}</div>}
          </div>

          <div className="form-group full-width">
            <label>Transaction Reference</label>
            <input
              name="transactionRef"
              value={form.transactionRef}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label>Remarks</label>
            <textarea
              name="remarks"
              rows="2"
              value={form.remarks}
              onChange={handleChange}
            />
          </div>
        </div>
		{/* Footer */}
        <div className="payment-footer">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}>
            Save Payment
          </button>
        </div>
		
		{/* Transaction History */}
		<div className="transaction-history">
		  <h5>Transaction History</h5>

		  {loadingTxns ? (
			<div className="text-muted">Loading...</div>
		  ) : receivedTransactions.length === 0 ? (
			<div className="text-muted">No transactions found</div>
		  ) : (
			<div className="txn-table-wrapper">
			  <table className="txn-table">
				<thead>
				  <tr>
					<th>Date</th>
					<th>Mode</th>
					<th>Ref</th>
					<th className="text-end">Amount</th>
				  </tr>
				</thead>
				<tbody>
				  {receivedTransactions.map((t) => (
					<tr key={t.id}>
					  <td>{formatDate(t.paymentDate)}</td>
					  <td>{t.paymentMode}</td>
					  <td>{t.transactionRef || "-"}</td>
					  <td className="text-end">{t.amount}</td>
					</tr>
				  ))}
				</tbody>
			  </table>
			</div>
		  )}
		</div>

      </div>
    </div>
  );
}
