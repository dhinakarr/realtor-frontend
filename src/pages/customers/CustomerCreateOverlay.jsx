import React, { useEffect, useState } from "react";
import API from "../../api/api";

export default function CustomerCreateOverlay({ show, onClose, onCreated }) {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      API.get("/api/customers/form")
        .then((res) => {
          setFields(res.data.data.fields || []);
        })
        .catch((err) => console.error(err));
    }
  }, [show]);

  const validateField = (field, value) => {
	  const rules = field.extraSettings || {};
	  const fieldErrors = [];

	  // Required
	  if (field.required && (value === undefined || value === null || value === "")) {
		fieldErrors.push(`${field.displayLabel} is required`);
	  }

	  // Min length
	  if (rules.minLength && value && value.length < rules.minLength) {
		fieldErrors.push(
		  `${field.displayLabel} must be at least ${rules.minLength} characters`
		);
	  }

	  // Max length
	  if (rules.maxLength && value && value.length > rules.maxLength) {
		fieldErrors.push(
		  `${field.displayLabel} must be at most ${rules.maxLength} characters`
		);
	  }

	  // Pattern (Regex)
	  if (rules.pattern && value) {
		const regex = new RegExp(rules.pattern);
		if (!regex.test(value)) {
		  fieldErrors.push(
			rules.patternMessage || `${field.displayLabel} is invalid`
		  );
		}
	  }

	  return fieldErrors;
	};
	
	const validateForm = () => {
	  const newErrors = {};

	  fields.forEach((field) => {
		if (field.hidden) return;

		const value = formData[field.apiField];
		const fieldErrors = validateField(field, value);

		if (fieldErrors.length > 0) {
		  newErrors[field.apiField] = fieldErrors[0]; // show first error
		}
	  });

	  setErrors(newErrors);
	  return Object.keys(newErrors).length === 0;
	};
	
	const handleChange = (fieldName, value, fieldConfig) => {
	  setFormData((prev) => ({ ...prev, [fieldName]: value }));

	  // live validation
	  if (fieldConfig) {
		const fieldErrors = validateField(fieldConfig, value);
		setErrors((prev) => ({
		  ...prev,
		  [fieldName]: fieldErrors[0],
		}));
	  }
	};



  const handleSubmit = () => {
	  if (!validateForm()) {
		return; // ❌ stop submission
	  }
	  const fd = new FormData();

	  /// Separate file and rest of the data
	  const { profileImagePath, ...rest } = formData;

	  // Append customer JSON as a blob
	  fd.append("customer", new Blob([JSON.stringify(rest)], { type: "application/json" }));

	  // Append the file if exists
	  if (profileImagePath instanceof File) {
		fd.append("profileImage", profileImagePath);
	  }

	  API.post("/api/customers", fd)
		.then(() => {
		  onCreated(); // refresh list and close overlay
		})
		.catch((err) => console.error(err));
	};

  return (
    <>
      {/* BACKDROP */}
      <div className="overlay-backdrop" onClick={onClose}></div>

      {/* SLIDING PANEL */}
      <div className={`overlay-slide ${show ? "show" : ""}`}>
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5>Create Customer</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        {/* FORM BODY */}
        <div className="p-3">
          <div className="row">
            {fields.map((f) => (
              !f.hidden && (
                <div
                  key={f.apiField}
                  className={f.fieldType === "textarea" || f.fieldType === "radio" ? "col-12 mb-3" : "col-6 mb-3"}
                >
                  <label className="form-label">{f.displayLabel}</label>

                  {/* RADIO FIELD HANDLING */}
                  {f.fieldType === "radio" &&
					 Array.isArray(f.lookupData) &&
					 f.lookupData.length > 0 && (
					  <div className="d-flex flex-row align-items-center flex-wrap">
						{f.lookupData.map((opt, index) => (
						  <div className="form-check form-check-inline me-3" key={index}>
							<input
							  className="form-check-input"
							  type="radio"
							  name={f.apiField}
							  value={opt.key}
							  onChange={(e) => handleChange(f.apiField, e.target.value, f)}
							/>
							<label className="form-check-label ms-1">{opt.label}</label>
							{errors[f.apiField] && (
							  <div className="text-danger small">{errors[f.apiField]}</div>
							)}
						  </div>
						))}
					  </div>
					)}

                  {/* TEXT / EMAIL / NUMBER / DATE */}
                  {["text", "email", "number", "date"].includes(f.fieldType) && (
                    <input
                      type={f.fieldType}
                      className={`form-control ${errors[f.apiField] ? "is-invalid" : ""}`}
                      placeholder={f.extraSettings?.placeholder || ""}
					  value={formData[f.apiField] || ""}
                      onChange={(e) => handleChange(f.apiField, e.target.value, f)}
                    />
                  )}


                  {/* TEXTAREA */}
                  {f.fieldType === "textarea" && (
                    <textarea
                      className={`form-control ${errors[f.apiField] ? "is-invalid" : ""}`}
                      rows="3"
                      placeholder={f.extraSettings?.placeholder || ""}
					  value={formData[f.apiField] || ""}
                      onChange={(e) => handleChange(f.apiField, e.target.value, f)}
                    />
                  )}
					{errors[f.apiField] && (
					  <div className="invalid-feedback">{errors[f.apiField]}</div>
					)}
                  {/* FILE UPLOAD */}
                  {f.fieldType === "file" && (
                    <input
                      type="file"
                      className={`form-control ${errors[f.apiField] ? "is-invalid" : ""}`}
                      onChange={(e) => handleChange(f.apiField, e.target.files[0], f)}
                    />

                  )}
                </div>
              )
            ))}
          </div>

          <div className="text-end">
            <button className="btn btn-secondary me-2" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Create
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
