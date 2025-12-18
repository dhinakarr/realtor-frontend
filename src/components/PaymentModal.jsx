import { useState } from "react";
import "./PaymentModal.css";

export default function PaymentModal({ open, onClose, plotId, onSubmit }) {
	const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    paymentType: "RECEIVED",
    amount: "",
    paymentMode: "CASH",
    transactionRef: "",
    remarks: "",
    paidTo: "",
  });

  if (!open) return null;
  
  const validate = () => {
	  const newErrors = {};

	  if (!form.paymentType) {
		newErrors.paymentType = "Payment type is required";
	  }

	  if (!form.paymentMode) {
		newErrors.paymentMode = "Payment mode is required";
	  }

	  if (!form.amount || Number(form.amount) <= 0) {
		newErrors.amount = "Amount must be greater than 0";
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
            <select name="paymentType" value={form.paymentType} 
				onChange={handleChange}
				className={`form-control ${errors.paymentType ? "is-invalid" : ""}`}
				>
              <option value="RECEIVED">Received</option>
              <option value="PAID">Paid</option>
            </select>
			{errors.paymentType && (
			  <div className="invalid-feedback">{errors.paymentType}</div>
			)}
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input type="number" name="amount" value={form.amount} onChange={handleChange} 
			className={`form-control ${errors.amount ? "is-invalid" : ""}`}
			/>
			{errors.amount && (
			  <div className="invalid-feedback">{errors.amount}</div>
			)}
          </div>

          <div className="form-group">
            <label>Payment Mode</label>
            <select name="paymentMode" value={form.paymentMode} onChange={handleChange}
			className={`form-control ${errors.paymentType ? "is-invalid" : ""}`}
			>
              <option value="CASH">Cash</option>
			  <option value="CHEQUE">Cheque</option>
			  <option value="DD">DD</option>
              <option value="UPI">UPI</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
			{errors.paymentType && (
			  <div className="invalid-feedback">{errors.paymentType}</div>
			)}
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
