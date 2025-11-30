import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/api";
import PageHeader from "../../components/PageHeader";
import useModule from "../../hooks/useModule";
import { mapApiToRoute } from "../../utils/mapApiToRoute";

export default function FeatureCreatePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const module = useModule("/api/features");
  
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [record, setRecord] = useState({});
  const [metaList, setMetaList] = useState([]);
  const [newMeta, setNewMeta] = useState({ key: "", value: "" });
  
  // --------------------------------------------
  // LOAD FORM METADATA
  // --------------------------------------------
  useEffect(() => {
    API.get("/api/features/form", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      const formInfo = res.data.data;
      setForm(formInfo);

      // Initialize record
      const initialObj = {};
      formInfo.fields.forEach((f) => {
        initialObj[f.apiField] = "";
      });
      setRecord(initialObj);

      setLoading(false);
    });
  }, []);

  const updateField = (key, value) => {
    setRecord((prev) => ({ ...prev, [key]: value }));
  };

  // --------------------------------------------
  // META PROCESSING
  // --------------------------------------------
  const addMetaRow = () => {
    if (!newMeta.key.trim()) return;
    setMetaList([...metaList, newMeta]);
    setNewMeta({ key: "", value: "" });
  };

  const removeMetaRow = (i) =>
    setMetaList((prev) => prev.filter((_, idx) => idx !== i));

  // --------------------------------------------
  // FORM SUBMIT
  // --------------------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }

    const formData = new FormData();

    // Add normal fields
    Object.keys(record).forEach((key) => {
      if (key !== "meta") formData.append(key, record[key]);
    });

    API.post("/api/features", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
		"Content-Type": "application/json",
      },
    })
      .then(() => navigate("/admin/features"))
      .catch((err) => console.error(err));
  };

  if (loading) return <div className="p-4">Loading...</div>;

  // =========================================================
  // UNIVERSAL FIELD RENDERER WITH VALIDATION  (FINAL VERSION)
  // =========================================================
  const renderField = (f) => {
    const value = record[f.apiField] || "";
    const extra = f.extraSettings || {};

    // Clean pattern
    const cleanedPattern = extra.pattern
      ? extra.pattern.replace(/\\\\/g, "\\")
      : undefined;

    const commonProps = {
      className: "form-control",
      value,
      required: extra.required || false,
      placeholder: extra.placeholder || "",
      maxLength: extra.maxLength || undefined,
      minLength: extra.minLength || undefined,
      pattern: cleanedPattern,
      title: extra.patternMessage || extra.message || "",
      onChange: (e) => updateField(f.apiField, e.target.value),
    };

    // SELECT INPUT
    if (f.fieldType === "select") {
      return (
        <div className="mb-3" key={f.apiField}>
          <label className="form-label">{f.displayLabel}</label>
          <select {...commonProps} className="form-select">
            <option value="">Select {f.displayLabel}</option>
            {f.lookupData?.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.value}
              </option>
            ))}
          </select>
          {extra.hint && <small className="text-muted">{extra.hint}</small>}
        </div>
      );
    }

    // TEXTAREA
    if (f.fieldType === "textarea") {
      return (
        <div className="mb-3" key={f.apiField}>
          <label className="form-label">{f.displayLabel}</label>
          <textarea {...commonProps} rows="3" />
        </div>
      );
    }

    // NUMBER
    if (f.fieldType === "number") {
      return (
        <div className="mb-3" key={f.apiField}>
          <label className="form-label">{f.displayLabel}</label>
          <input type="text" {...commonProps} />
        </div>
      );
    }

    // EMAIL
    if (f.fieldType === "email") {
      return (
        <div className="mb-3" key={f.apiField}>
          <label className="form-label">{f.displayLabel}</label>
          <input type="email" {...commonProps} />
        </div>
      );
    }

    // DEFAULT INPUT
    return (
      <div className="mb-3" key={f.apiField}>
        <label className="form-label">{f.displayLabel}</label>
        <input type={f.fieldType} {...commonProps} />
      </div>
    );
  };

  // --------------------------------------------
  // FRONTEND UI
  // --------------------------------------------
  return (
    <div className="container">
	  {module && <PageHeader module={module} mapApiToRoute={mapApiToRoute} />}
	  <p></p>
      <h3 className="text-center">Create Role</h3>

      <form className="card p-4 mt-3" onSubmit={handleSubmit}>
        {/* Dynamic fields */}
        {form.fields.map((f) => renderField(f))}

        

        {/* Buttons */}
        <div className="d-flex justify-content-center gap-2 mt-4">
          <button className="btn btn-success" type="submit">
            Create
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
