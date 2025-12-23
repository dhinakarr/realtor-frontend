import React, { useState } from "react";
import { Offcanvas, Button, Spinner } from "react-bootstrap";
import API from "../../api/API";
import DynamicFormRenderer from "../../components/DynamicFormRenderer";
import { useToast } from "../../components/common/ToastProvider";

export default function SitePaymentDrawer({ show, onClose, onSaved, 
					siteVisitId, userId, balance }) {
  const [record, setRecord] = useState({
				  amount: "",
				  paymentMode: "",
				  remarks: ""
				});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  // Payment form spec (static since server doesn't send dynamic form)
  const formSpec = {
    fields: [
      {
        apiField: "amount",
        displayLabel: "Amount",
        fieldType: "number",
        required: true,
        extraSettings: { placeholder: "Enter payment amount" }
      },
      {
        apiField: "paymentMode",
        displayLabel: "Payment Mode",
        fieldType: "select",
        required: true,
        lookupData: [
          { key: "CASH", value: "CASH" },
          { key: "UPI", value: "UPI" },
          { key: "BANK", value: "BANK" }
        ]
      },
      {
        apiField: "remarks",
        displayLabel: "Remarks",
        fieldType: "text",
        required: false,
        extraSettings: { placeholder: "Enter remarks" }
      }
    ]
  };

  const updateField = (field, value) => {
    setRecord((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const validate = () => {
    const errs = {};
    formSpec.fields.forEach((f) => {
      const value = record[f.apiField];
      if (f.required && (!value || value.toString().trim() === "")) {
        errs[f.apiField] = `${f.displayLabel} is required`;
      }
    });

	// 🔑 Business validation: payment <= balance
	  if (record.amount && balance != null) {
		const amount = Number(record.amount);
		const max = Number(balance);

		if (amount > max) {
		  showToast(`Payment amount cannot exceed balance (${max})`);
		  return;
		}

		if (amount <= 0) {
		  showToast("Payment amount must be greater than zero");
		  return;
		}
	  }
	  
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
	
	const payload = {
		...record,
		userId // 👈 injected, hidden from UI
	  };

    setSaving(true);
    try {
      await API.post(`/api/site-visits/${siteVisitId}/payments`, payload);
      onSaved?.(); // refresh list or site visit detail
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Offcanvas
      show={show}
      onHide={onClose}
      placement="end"
      backdrop
      style={{ width: "500px" }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Add Payment</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        <DynamicFormRenderer
          form={formSpec}
          record={record}
          updateField={updateField}
          errors={errors}
          layout={{ columns: 2 }}
        />

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : "Add Payment"}
          </Button>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
