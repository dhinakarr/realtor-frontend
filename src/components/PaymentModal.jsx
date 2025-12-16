import { useState } from "react";
import "./PaymentModal.css";

export default function PaymentModal({ open, onClose, plotId, onSubmit }) {
  const [form, setForm] = useState({
    paymentType: "RECEIVED",
    amount: "",
    paymentMode: "CASH",
    transactionRef: "",
    remarks: "",
    paidTo: "",
  });

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = () => {
	  //console.log("@PaymentModal plotId: "+plotId);
    onSubmit({
      plotId,
      ...form,
      amount: Number(form.amount),
    });
  };

  return (
    <div className="payment-overlay" onClick={onClose}>
      <div className="payment-drawer" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="payment-header">
          <div>
            <h2>Add Payment</h2>
            
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="payment-body">
          <div className="form-group">
            <label>Payment Type</label>
            <select name="paymentType" value={form.paymentType} onChange={handleChange}>
              <option value="RECEIVED">Received</option>
              <option value="PAID">Paid</option>
            </select>
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input type="number" name="amount" value={form.amount} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Payment Mode</label>
            <select name="paymentMode" value={form.paymentMode} onChange={handleChange}>
              <option value="CASH">Cash</option>
			  <option value="CHEQUE">Cheque</option>
			  <option value="DD">DD</option>
              <option value="UPI">UPI</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>

          <div className="form-group">
            <label>Transaction Reference</label>
            <input name="transactionRef" value={form.transactionRef} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Remarks</label>
            <textarea name="remarks" rows="3" value={form.remarks} onChange={handleChange} />
          </div>
        </div>

        {/* Footer */}
        <div className="payment-footer">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}>Save Payment</button>
        </div>
      </div>
    </div>
  );
}
