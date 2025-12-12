import React from "react";

export default function DynamicFormRenderer({ form, record, updateField }) {
  if (!form || !form.fields) return null;

  return (
    <>
      {form.fields.map((f) => {
        const value = record[f.apiField];

        // TEXT INPUT
        if (["text", "string"].includes(f.fieldType)) {
          return (
            <div className="mb-3" key={f.apiField}>
              <label className="form-label">{f.displayLabel}</label>
              <input
                type="text"
                className="form-control"
                value={value || ""}
                onChange={(e) => updateField(f.apiField, e.target.value)}
              />
            </div>
          );
        }

        // NUMBER
        if (f.fieldType === "number") {
          return (
            <div className="mb-3" key={f.apiField}>
              <label className="form-label">{f.displayLabel}</label>
              <input
                type="number"
                className="form-control"
                value={value || ""}
                onChange={(e) => updateField(f.apiField, e.target.value)}
              />
            </div>
          );
        }

        // TEXTAREA
        if (f.fieldType === "textarea") {
          return (
            <div className="mb-3" key={f.apiField}>
              <label className="form-label">{f.displayLabel}</label>
              <textarea
                className="form-control"
                rows={3}
                value={value || ""}
                onChange={(e) => updateField(f.apiField, e.target.value)}
              ></textarea>
            </div>
          );
        }

        // DATE FIELD
        if (f.fieldType === "date") {
          return (
            <div className="mb-3" key={f.apiField}>
              <label className="form-label">{f.displayLabel}</label>
              <input
                type="date"
                className="form-control"
                value={value || ""}
                onChange={(e) => updateField(f.apiField, e.target.value)}
              />
            </div>
          );
        }

        // SELECT DROPDOWN
        if (f.fieldType === "select") {
          return (
            <div className="mb-3" key={f.apiField}>
              <label className="form-label">{f.displayLabel}</label>
              <select
                className="form-select"
                value={value || ""}
                onChange={(e) => updateField(f.apiField, e.target.value)}
              >
                <option value="">Select {f.displayLabel}</option>
                {f.lookupData?.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.value}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        // CHECKBOX
        if (f.fieldType === "checkbox") {
          return (
            <div className="form-check mb-3" key={f.apiField}>
              <input
                type="checkbox"
                className="form-check-input"
                id={f.apiField}
                checked={value === true}
                onChange={(e) => updateField(f.apiField, e.target.checked)}
              />
              <label className="form-check-label" htmlFor={f.apiField}>
                {f.displayLabel}
              </label>
            </div>
          );
        }

        // FILE UPLOAD
        if (f.fieldType === "file") {
          return (
            <div className="mb-3" key={f.apiField}>
              <label className="form-label">{f.displayLabel}</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => updateField(f.apiField, e.target.files[0])}
              />
            </div>
          );
        }

        // DEFAULT TEXT
        return (
          <div className="mb-3" key={f.apiField}>
            <label className="form-label">{f.displayLabel}</label>
            <input
              type="text"
              className="form-control"
              value={value || ""}
              onChange={(e) => updateField(f.apiField, e.target.value)}
            />
          </div>
        );
      })}
    </>
  );
}
