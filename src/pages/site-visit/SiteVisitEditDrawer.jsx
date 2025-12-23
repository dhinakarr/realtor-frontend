import React, { useEffect, useState } from "react";
import { Offcanvas, Button, Spinner } from "react-bootstrap";
import API from "../../api/API";
import DynamicFormRenderer from "../../components/DynamicFormRenderer";

export default function SiteVisitEditDrawer({ show, onClose, siteVisitId, onSaved }) {
  const [formSpec, setFormSpec] = useState(null); // form fields
  const [record, setRecord] = useState({});       // current values
  const [originalRecord, setOriginalRecord] = useState({}); // keep original for diff
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) fetchForm();
  }, [show]);

  const fetchForm = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/api/site-visits/form/${siteVisitId}`);
      const data = res.data.data;
	  
	  const recordData = { ...data.data };

		// Map customers to customerId array before setting state
		if (recordData.customers) {
		  recordData.customerId = recordData.customers.map(c => c.customerId);
		}
	  
	  setFormSpec(data.form);
      setRecord(recordData);
	  setOriginalRecord(recordData);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setRecord(prev => ({ ...prev, [field]: value }));
  };

  // Validation
  const validate = () => {
    const errs = {};
    formSpec.fields.forEach(f => {
      const value = record[f.apiField];
      if (f.required && (value === undefined || value === null || value.toString().trim() === "" || (Array.isArray(value) && value.length === 0))) {
        errs[f.apiField] = `${f.displayLabel} is required`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Extract changed fields only
  const getChangedFields = () => {
    const changed = {};
    Object.keys(record).forEach(key => {
      const originalValue = originalRecord[key];
      const currentValue = record[key];
      if (Array.isArray(currentValue)) {
        if (JSON.stringify(currentValue) !== JSON.stringify(originalValue || [])) {
          changed[key] = currentValue;
        }
      } else if (currentValue !== originalValue) {
        changed[key] = currentValue;
      }
    });
    return changed;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const changedData = getChangedFields();
    if (Object.keys(changedData).length === 0) {
      alert("No changes detected");
      return;
    }

    setSaving(true);
    try {
      await API.patch(`/api/site-visits/${siteVisitId}`, changedData);
      onSaved?.(); // refresh list
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
      style={{ width: "600px" }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Edit Site Visit</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        {loading && <Spinner animation="border" />}

        {!loading && formSpec && (
          <>
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
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
