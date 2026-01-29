import React, { useEffect, useState } from "react";
import API from "../../api/api";
import "./UserEditOverlay.css";

export default function UserEditOverlay({ show, onClose, userId, onSuccess }) {
  const token = localStorage.getItem("accessToken");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [record, setRecord] = useState({});
  const [initialData, setInitialData] = useState({});
  const [errors, setErrors] = useState({});
  const [metaList, setMetaList] = useState([]);
  const [newMeta, setNewMeta] = useState({ key: "", value: "" });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    API.get(`/api/users/editForm/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        const data = res.data.data.data || {};
        const formInfo = res.data.data.form;

        setForm(formInfo);
        setRecord(data);
        setInitialData(data);

        const metaPairs = Object.entries(data.meta || {}).map(([key, value]) => ({ key, value }));
        setMetaList(metaPairs);

        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load form:", err);
        setLoading(false);
      });
  }, [show, userId]);

  const updateField = (key, value) => {
    setRecord(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: "" }));
  };

  const addMetaRow = () => {
    if (!newMeta.key.trim()) return;
    setMetaList(prev => [...prev, { ...newMeta }]);
    setNewMeta({ key: "", value: "" });
  };
  
  const getImageSrc = (img) => {
    if (!img) return null;
    if (img.length > 50 && !img.startsWith("data:image"))
      return "data:image/jpeg;base64," + img;
    if (img.startsWith("uploads") || img.startsWith("profile"))
      return "http://127.0.0.1:8080/" + img;
    return img;
  };

  const removeMetaRow = i => setMetaList(prev => prev.filter((_, idx) => idx !== i));

  const validateField = (field, value) => {
    const extra = field.extraSettings || {};
    const valStr = String(value || "");
    if (field.required && !valStr.trim()) return `${field.displayLabel} is required`;
    if (extra.minLength && valStr.length < extra.minLength) return `${field.displayLabel} must be at least ${extra.minLength}`;
    if (extra.maxLength && valStr.length > extra.maxLength) return `${field.displayLabel} cannot exceed ${extra.maxLength}`;
    if (extra.pattern) {
      try {
        const regex = new RegExp(extra.pattern.replace(/\\\\/g, "\\"));
        if (!regex.test(valStr)) return `${field.displayLabel} is invalid`;
      } catch (e) {}
    }
    return null;
  };

  const validateAll = () => {
    const newErrors = {};
    (form?.fields || []).forEach(f => {
      const errMsg = validateField(f, record[f.apiField]);
      if (errMsg) newErrors[f.apiField] = errMsg;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateAll()) return;

    const formData = new FormData();
    const updates = {};
    Object.keys(record).forEach(key => {
      if (key === "meta") return;
      if (record[key] !== initialData[key]) updates[key] = record[key];
    });

    const metaObj = Object.fromEntries(metaList.map(m => [m.key, m.value]));
    if (JSON.stringify(metaObj) !== JSON.stringify(initialData.meta || {})) updates.meta = metaObj;
    if (imageFile) updates.profileImage = imageFile;

    Object.keys(updates).forEach(k => {
      if (k === "meta") formData.append("meta", JSON.stringify(updates[k]));
      else formData.append(k, updates[k]);
    });

    try {
      await API.patch(`/api/users/${userId}`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const renderField = (f) => {
    const value = record[f.apiField] ?? "";
    const extra = f.extraSettings || {};
    const hasError = !!errors[f.apiField];
    const colClass = f.fieldType === "textarea" ? "col-md-12" : "col-md-6";
	const isEmailField = f.apiField === "email";
	
    const commonProps = {
      className: `form-control ${hasError ? "is-invalid" : ""}`,
      value,
      placeholder: extra.placeholder || "",
      onChange: (e) => updateField(f.apiField, e.target.value),
      required: f.required || false,
	  disabled: isEmailField,
    };

    if (f.fieldType === "select") {
      return (
        <div className={`${colClass} mb-2`} key={f.apiField}>
          <label className="form-label">{f.displayLabel}</label>
          <select {...commonProps} className="form-select">
            <option value="">Select {f.displayLabel}</option>
            {f.lookupData?.map(opt => <option key={opt.key} value={opt.key}>{opt.value}</option>)}
          </select>
        </div>
      );
    }

    if (f.fieldType === "textarea") {
      return (
        <div className={`${colClass} mb-2`} key={f.apiField}>
          <label className="form-label">{f.displayLabel}</label>
          <textarea {...commonProps} rows="3" />
        </div>
      );
    }

    return (
      <div className={`${colClass} mb-2`} key={f.apiField}>
        <label className="form-label">{f.displayLabel}</label>
        <input type={f.fieldType === "number" ? "text" : f.fieldType} {...commonProps} />
      </div>
    );
  };

  if (!show || loading) return null;

  return (
    <div className="overlay-slide">
      <form className="card p-3 compact-form" onSubmit={handleSubmit}>
        <div className="d-flex justify-content-between align-items-center mb-3">
		  <h5 className="m-0">Edit User</h5>
		  <button
			type="button"
			className="btn btn-light btn-sm"
			onClick={onClose}  // calls setShowEditOverlay(false)
			style={{ fontSize: "1.2rem" }}
		  >
			✕
		  </button>
		</div>

        <div className="row">
          {form?.fields.map(f => renderField(f))}
        </div>

        {/* Image Upload */}
        <div className="mb-3">
          <label className="form-label">Profile Image</label>
          <input type="file" className="form-control" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
          {record.profileImage && <img src={getImageSrc(record.profileImage)} alt="" className="img-thumbnail mt-2" style={{ width: "120px", height: "120px" }} />}
        </div>

        {/* Meta Fields */}
        <h5 className="mt-3">Meta Fields</h5>
        <div className="row mb-2">
          <div className="col">
            <input type="text" className="form-control" placeholder="Key" value={newMeta.key} onChange={e => setNewMeta(p => ({ ...p, key: e.target.value }))} />
          </div>
          <div className="col">
            <input type="text" className="form-control" placeholder="Value" value={newMeta.value} onChange={e => setNewMeta(p => ({ ...p, value: e.target.value }))} />
          </div>
          <div className="col-auto">
            <button type="button" className="btn btn-primary" onClick={addMetaRow}>+ Add</button>
          </div>
        </div>

        {metaList.map((m, i) => (
          <div className="row mb-2" key={i}>
            <div className="col">
              <input type="text" className="form-control" value={m.key} onChange={e => setMetaList(prev => prev.map((item, idx) => idx === i ? { ...item, key: e.target.value } : item))} />
            </div>
            <div className="col">
              <input type="text" className="form-control" value={m.value} onChange={e => setMetaList(prev => prev.map((item, idx) => idx === i ? { ...item, value: e.target.value } : item))} />
            </div>
            <div className="col-auto">
              <button type="button" className="btn btn-danger" onClick={() => removeMetaRow(i)}>✕</button>
            </div>
          </div>
        ))}

        <div className="d-flex justify-content-center gap-2 mt-3">
          <button type="submit" className="btn btn-success">Save</button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
