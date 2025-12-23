import React, { useEffect, useState } from "react";
import { Offcanvas, Button, Spinner } from "react-bootstrap";
import API from "../../api/API";
import DynamicFormRenderer from "../../components/DynamicFormRenderer";


export default function SiteVisitFormDrawer({ show, onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [record, setRecord] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      fetchForm();
    }
  }, [show]);

  const fetchForm = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/site-visits/form");
      setForm(res.data.data);
      setRecord({}); // reset form
    } finally {
      setLoading(false);
    }
  };
  
  const validate = () => {
	  const errs = {};

	  form.fields.forEach((f) => {
		const value = record[f.apiField];

		if (f.required) {
		  if (Array.isArray(value) && value.length === 0) {
			errs[f.apiField] = `${f.displayLabel} is required`;
		  } else if (!value || value.toString().trim() === "") {
			errs[f.apiField] = `${f.displayLabel} is required`;
		  }
		}
	  });

	  setErrors(errs);
	  return Object.keys(errs).length === 0;
	};




  const updateField = (field, value) => {
    setRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
	  const isValid = validate();
	  if (!isValid) return; // ⛔ STOP submission

	  setSaving(true);
	  try {
		await API.post("/api/site-visits", record);
		onSaved?.();
		onClose();
	  } finally {
		setSaving(false);
	  }
	};


  return (
    <Offcanvas show={show} onHide={onClose} placement="end" backdrop style={{ width: "500px" }} >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>New Site Visit</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        {loading && <Spinner animation="border" />}

        {!loading && form && (
          <>
            <DynamicFormRenderer
              form={form}
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
