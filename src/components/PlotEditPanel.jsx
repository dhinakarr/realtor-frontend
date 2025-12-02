import React, { useEffect, useState } from "react";
import API from "../api/api";
import "./PlotEditPanel.css";

export default function PlotEditPanel({ plotId, onClose, onSaved }) {
  const [formSpec, setFormSpec] = useState(null); // form descriptor (fields array)
  const [dataObj, setDataObj] = useState(null); // existing data values
  const [values, setValues] = useState({}); // current editable values keyed by apiField
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // load form + data
  useEffect(() => {
    if (!plotId) return;

    setLoading(true);
    API.get(`/api/plots/form/${plotId}`)
      .then((res) => {
        // expected structure: res.data.data.data (data) and res.data.data.form (form)
        const resp = res.data;
        if (resp.success && resp.data) {
          const existing = resp.data.data || {};
          const form = resp.data.form || {};
          setFormSpec(form);
          setDataObj(existing);

          // initialize values from existing data using apiField names
          const init = {};
          (form.fields || []).forEach((f) => {
            if (f.hidden) return;
            const key = f.apiField;
            // copy existing value if present, otherwise default based on fieldType
            let val = existing[key];
            if (val === null || typeof val === "undefined") {
              if (f.fieldType === "checkbox") val = !!f.defaultValue || false;
              else val = "";
            }
            init[key] = val;
          });
          setValues(init);
        } else {
          console.error("Unexpected form response", res);
        }
      })
      .catch((err) => {
        console.error("Error loading plot form:", err);
      })
      .finally(() => setLoading(false));
  }, [plotId]);

  if (!plotId) return null;

  const handleChange = (apiField, fieldType) => (e) => {
    let val;
    if (fieldType === "checkbox") {
      val = e.target.checked;
    } else if (fieldType === "number") {
      // keep as string while typing but convert to number on save
      val = e.target.value;
    } else {
      val = e.target.value;
    }
    setValues((s) => ({ ...s, [apiField]: val }));
    setErrors((s) => ({ ...s, [apiField]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!formSpec || !formSpec.fields) return errs;
    formSpec.fields.forEach((f) => {
      if (f.hidden) return;
      if (f.required) {
        const v = values[f.apiField];
        // treat empty string or null/undefined as error
        if (
          v === null ||
          typeof v === "undefined" ||
          (typeof v === "string" && v.trim() === "")
        ) {
          errs[f.apiField] = `${f.displayLabel} is required`;
        }
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    // prepare payload: convert number fields to numbers, keep checkboxes boolean
    const payload = {};
    (formSpec.fields || []).forEach((f) => {
      if (f.hidden) return;
      const key = f.apiField;
      let v = values[key];
      if (f.fieldType === "number") {
        // convert empty string to null, otherwise number
        if (v === "" || typeof v === "undefined" || v === null) {
          v = null;
        } else {
          // try convert to number
          const num = Number(v);
          v = Number.isNaN(num) ? null : num;
        }
      } else if (f.fieldType === "checkbox") {
        v = !!v;
      } else {
        // text
        if (typeof v === "string") v = v.trim();
      }
      payload[key] = v;
    });

    try {
      setSaving(true);
      const res = await API.patch(`/api/plots/${plotId}`, payload);
      if (res.data && res.data.success) {
        if (onSaved) onSaved();
        if (onClose) onClose();
      } else {
        // show server-side validation if any
        console.error("Save failed:", res);
        alert(res.data?.message || "Save failed");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Error while saving. See console.");
    } finally {
      setSaving(false);
    }
  };

  const renderFieldControl = (f) => {
    const key = f.apiField;
    const val = values[key];
    const placeholder =
      (f.extraSettings && f.extraSettings.placeholder) || "";

    if (f.fieldType === "checkbox") {
      return (
        <div className="form-check">
          <input
            id={key}
            name={key}
            type="checkbox"
            className="form-check-input"
            checked={!!val}
            onChange={handleChange(key, f.fieldType)}
          />
          <label htmlFor={key} className="form-check-label ms-2">
            {f.displayLabel}
          </label>
          {errors[key] && <div className="text-danger small">{errors[key]}</div>}
        </div>
      );
    }

    if (f.fieldType === "number") {
      return (
        <>
          <label className="form-label" htmlFor={key}>
            {f.displayLabel}
          </label>
          <input
            id={key}
            name={key}
            type="number"
            className="form-control"
            placeholder={placeholder}
            value={val === null || typeof val === "undefined" ? "" : val}
            onChange={handleChange(key, f.fieldType)}
          />
          {errors[key] && <div className="text-danger small">{errors[key]}</div>}
        </>
      );
    }

    // default to text
    return (
      <>
        <label className="form-label" htmlFor={key}>
          {f.displayLabel}
        </label>
        <input
          id={key}
          name={key}
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={val === null || typeof val === "undefined" ? "" : val}
          onChange={handleChange(key, f.fieldType)}
        />
        {errors[key] && <div className="text-danger small">{errors[key]}</div>}
      </>
    );
  };

  return (
    <div className="plot-panel-overlay">
      <div className="plot-panel">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Edit Plot</h4>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading && <p>Loading...</p>}

        {!loading && (!formSpec || !formSpec.fields) && (
          <div className="alert alert-warning">Form configuration not available.</div>
        )}

        {!loading && formSpec && (
          <form className="plot-form">
            <div className="container-fluid">
              <div className="row">
                {(formSpec.fields || [])
                  .filter((f) => !f.hidden)
                  .map((f) => (
                    <div className="col-md-6 mb-3" key={f.apiField}>
                      {renderFieldControl(f)}
                    </div>
                  ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
                Back
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
