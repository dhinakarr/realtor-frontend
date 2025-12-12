import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/api";
import PageHeader from "../../components/PageHeader";
import useModule from "../../hooks/useModule";
import { mapApiToRoute } from "../../utils/mapApiToRoute";

export default function UserEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const module = useModule("/api/users");

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState({});
  const [initialData, setInitialData] = useState({});
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [metaList, setMetaList] = useState([]);
  const [newMeta, setNewMeta] = useState({ key: "", value: "" });
  const [imageFile, setImageFile] = useState(null);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    API.get(`/api/users/editForm/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      const data = res.data.data.data || {};
      const formInfo = res.data.data.form;

      setRecord(data);
      setInitialData(data);
      setForm(formInfo);

      const metaPairs = Object.entries(data.meta || {}).map(([key, value]) => ({
        key,
        value,
      }));
      setMetaList(metaPairs);
      setLoading(false);
    }).catch((err) => {
      console.error("Failed to load form:", err);
      setLoading(false);
    });
  }, [id]);

  const updateField = (key, value) => {
    setRecord((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" })); // Clear error on typing
  };

  // -------- META HANDLERS (restored) ----------
  const addMetaRow = () => {
    if (!newMeta.key || !newMeta.key.trim()) return;
    setMetaList((prev) => [...prev, { ...newMeta }]);
    setNewMeta({ key: "", value: "" });
  };

  const removeMetaRow = (index) => {
    setMetaList((prev) => prev.filter((_, i) => i !== index));
  };

  // =====================================================
  // ⭐ UNIVERSAL VALIDATION FUNCTION
  // =====================================================
  const validateField = (field, value) => {
    const extra = field.extraSettings || {};

    const valStr = typeof value === "string" ? value : String(value || "");

    if (field.required && !valStr.trim()) {
      return extra.requiredMessage || `${field.displayLabel} is required`;
    }

    if (extra.minLength && valStr.length < extra.minLength) {
      return (
        extra.minLengthMessage ||
        `${field.displayLabel} must be at least ${extra.minLength} characters`
      );
    }

    if (extra.maxLength && valStr.length > extra.maxLength) {
      return (
        extra.maxLengthMessage ||
        `${field.displayLabel} cannot exceed ${extra.maxLength} characters`
      );
    }

    if (extra.pattern) {
      const cleanPattern = extra.pattern.replace(/\\\\/g, "\\");
      try {
        const regex = new RegExp(cleanPattern);
        if (!regex.test(valStr)) {
          return extra.patternMessage || `${field.displayLabel} is invalid`;
        }
      } catch (e) {
        // invalid regex from backend — don't crash, log and skip
        console.warn("Invalid pattern for field", field.apiField, e);
      }
    }

    return null;
  };

  // =====================================================
  // ⭐ VALIDATE ALL FIELDS BEFORE SUBMIT
  // =====================================================
  const validateAll = () => {
    const newErrors = {};

    (form?.fields || []).forEach((f) => {
      const value = record[f.apiField] ?? "";
      const errMsg = validateField(f, value);
      if (errMsg) newErrors[f.apiField] = errMsg;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // ⭐ FINAL SUBMIT
  // =====================================================
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateAll()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const formData = new FormData();
    const updates = {};

    Object.keys(record).forEach((key) => {
      if (key === "meta") return;
      if (record[key] !== initialData[key]) updates[key] = record[key];
    });

    const metaObj = {};
    metaList.forEach((m) => {
      if (m.key && m.key.trim()) metaObj[m.key] = m.value;
    });

    if (JSON.stringify(metaObj) !== JSON.stringify(initialData.meta || {})) {
      updates.meta = metaObj;
    }

    if (imageFile) updates.profileImage = imageFile;

    for (const key in updates) {
      if (key === "meta") {
        formData.append("meta", JSON.stringify(updates[key]));
      } else {
        formData.append(key, updates[key]);
      }
    }

    API.patch(`/api/users/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })
      .then(() => navigate(`/admin/users/view/${id}`))
      .catch((err) => {
        console.error(err);
        // optionally set server-side errors to UI
      });
  };

  if (loading) return <div className="p-4">Loading...</div>;

  // =====================================================
  // ⭐ DYNAMIC FIELD RENDERER (with inline errors)
  // =====================================================
  const renderField = (f) => {
    const value = record[f.apiField] ?? "";
    const extra = f.extraSettings || {};
    const cleanedPattern = extra.pattern ? extra.pattern.replace(/\\\\/g, "\\") : undefined;

    const hasError = Boolean(errors[f.apiField]);

    const commonProps = {
      className: `form-control ${hasError ? "is-invalid" : ""}`,
      value,
      placeholder: extra.placeholder || "",
      maxLength: extra.maxLength || undefined,
      minLength: extra.minLength || undefined,
      pattern: cleanedPattern,
      required: f.required || false,
      onChange: (e) => updateField(f.apiField, e.target.value),
    };

    return (
      <div className="mb-3" key={f.apiField}>
        <label className="form-label">{f.displayLabel}</label>

        {/* SELECT */}
        {f.fieldType === "select" ? (
          <select
            {...commonProps}
            className={commonProps.className.replace("form-control", "form-select")}
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
        ) : f.fieldType === "textarea" ? (
          <textarea {...commonProps} />
        ) : (
          // treat number fields as text for proper length validation (but can enforce digits via pattern)
          <input
            {...commonProps}
            type={f.fieldType === "number" ? "text" : f.fieldType}
            inputMode={f.fieldType === "number" ? "numeric" : undefined}
			readOnly={f.apiField === "email"}   // ⬅ MAKE EMAIL READONLY
			style={f.apiField === "email" ? { backgroundColor: "#eee" } : {}}
          />
        )}

        {/* hint */}
        {extra.hint && <small className="text-muted d-block">{extra.hint}</small>}

        {/* INLINE ERROR */}
        {hasError && <div className="invalid-feedback">{errors[f.apiField]}</div>}
      </div>
    );
  };

  // Non-dynamic fields
  const apiFields = (form?.fields || []).map((f) => f.apiField);
  const otherFields = Object.keys(record).filter(
    (k) =>
      !apiFields.includes(k) &&
      !["meta", "profileImage", "passwordHash", "userId", "managerName", "roleName"].includes(k)
  );

  const getImageSrc = (img) => {
    if (!img) return null;
    if (img.length > 50 && !img.startsWith("data:image"))
      return "data:image/jpeg;base64," + img;
    if (img.startsWith("uploads") || img.startsWith("profile"))
      return "http://localhost:8080/" + img;
    return img;
  };

  return (
    <div className="container">
      {module && <PageHeader module={module} mapApiToRoute={mapApiToRoute} />}

      <h3 className="text-center">Edit User</h3>

      <form className="card p-4 mt-3" onSubmit={handleSubmit}>
        {form.fields.map((f) => renderField(f))}

        {otherFields.map((field) => (
          <div className="mb-3" key={field}>
            <label className="form-label">{field}</label>
            <input
              type="text"
              className="form-control"
              value={record[field] || ""}
              onChange={(e) => updateField(field, e.target.value)}
            />
          </div>
        ))}

        <div className="mb-3">
          <label className="form-label">Profile Image</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          {record.profileImage && (
            <img
              src={getImageSrc(record.profileImage)}
              className="img-thumbnail mt-2"
              style={{ width: "120px", height: "120px" }}
            />
          )}
        </div>

        {/* META EDITOR */}
        <h5 className="mt-4">Meta Fields</h5>

        <div className="row mb-3">
          <div className="col">
            <input
              type="text"
              placeholder="Key"
              className="form-control"
              value={newMeta.key}
              onChange={(e) => setNewMeta((p) => ({ ...p, key: e.target.value }))}
            />
          </div>
          <div className="col">
            <input
              type="text"
              placeholder="Value"
              className="form-control"
              value={newMeta.value}
              onChange={(e) => setNewMeta((p) => ({ ...p, value: e.target.value }))}
            />
          </div>
          <div className="col-auto">
            <button type="button" className="btn btn-primary" onClick={addMetaRow}>
              + Add
            </button>
          </div>
        </div>

        {metaList.map((m, i) => (
          <div className="row mb-2" key={i}>
            <div className="col">
              <input
                type="text"
                className="form-control"
                value={m.key}
                onChange={(e) =>
                  setMetaList((prev) =>
                    prev.map((item, idx) =>
                      idx === i ? { ...item, key: e.target.value } : item
                    )
                  )
                }
              />
            </div>
            <div className="col">
              <input
                type="text"
                className="form-control"
                value={m.value}
                onChange={(e) =>
                  setMetaList((prev) =>
                    prev.map((item, idx) =>
                      idx === i ? { ...item, value: e.target.value } : item
                    )
                  )
                }
              />
            </div>
            <div className="col-auto">
              <button type="button" className="btn btn-danger" onClick={() => removeMetaRow(i)}>
                ✕
              </button>
            </div>
          </div>
        ))}

        <div className="d-flex justify-content-center gap-2 mt-4">
          <button className="btn btn-success" type="submit">
            Save
          </button>

          <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
