import React, { useEffect, useState } from "react";
import API from "../../api/api";

export default function CustomerCreateOverlay({ show, onClose, onCreated }) {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (show) {
      API.get("/api/customers/form")
        .then((res) => {
          setFields(res.data.data.fields || []);
        })
        .catch((err) => console.error(err));
    }
  }, [show]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
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
          <h4>Create Customer</h4>
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
							  onChange={(e) => handleChange(f.apiField, e.target.value)}
							/>
							<label className="form-check-label ms-1">{opt.label}</label>
						  </div>
						))}
					  </div>
					)}

                  {/* TEXT / EMAIL / NUMBER / DATE */}
                  {["text", "email", "number", "date"].includes(f.fieldType) && (
                    <input
                      type={f.fieldType}
                      className="form-control"
                      placeholder={f.extraSettings?.placeholder || ""}
                      onChange={(e) => handleChange(f.apiField, e.target.value)}
                    />
                  )}

                  {/* TEXTAREA */}
                  {f.fieldType === "textarea" && (
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder={f.extraSettings?.placeholder || ""}
                      onChange={(e) => handleChange(f.apiField, e.target.value)}
                    />
                  )}

                  {/* FILE UPLOAD */}
                  {f.fieldType === "file" && (
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => handleChange(f.apiField, e.target.files[0])}
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
