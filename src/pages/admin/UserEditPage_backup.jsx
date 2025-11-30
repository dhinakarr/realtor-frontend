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
  const [metaList, setMetaList] = useState([]);
  const [newMeta, setNewMeta] = useState({ key: "", value: "" });
  const [imageFile, setImageFile] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    API.get(`/api/users/editForm/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      const data = res.data.data.data || {};
      const formInfo = res.data.data.form;

      setRecord(data);
      setForm(formInfo);
	  setInitialData(data);
      // Convert meta object → list
      const metaPairs = Object.entries(data.meta || {}).map(
        ([key, value]) => ({ key, value })
      );
      setMetaList(metaPairs);

      setLoading(false);
    });
  }, [id]);

  const updateField = (apiField, value) => {
    setRecord((prev) => ({ ...prev, [apiField]: value }));
  };

  // ========== META ==========
  const addMetaRow = () => {
    if (!newMeta.key.trim()) return;

    setMetaList([...metaList, { ...newMeta }]);
    setNewMeta({ key: "", value: "" });
  };

  const removeMetaRow = (index) => {
    const updated = metaList.filter((_, i) => i !== index);
    setMetaList(updated);
  };

  // ========== SUBMIT ==========
  const handleSubmit = () => {
    const formData = new FormData();
    const updates = {};

	  // 1. NORMAL FIELDS
	  Object.keys(record).forEach((key) => {
		if (key === "meta") return; // handled separately

		if (record[key] !== initialData[key]) {
			updates[key] = record[key];
		  }
	  });
    // meta
    const metaObj = {};
    metaList.forEach((m) => {
      if (m.key) metaObj[m.key] = m.value;
    });
	if (JSON.stringify(metaObj) !== JSON.stringify(initialData.meta || {})) {
		updates.meta = metaObj;
	}
    // image
    if (imageFile) {
      updates.profileImage = imageFile;
    }
	
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
        "Content-Type": "multipart/form-data"
      }
    })
      .then(() => navigate(`/admin/users/view/${id}`))
      .catch((err) => console.error(err));
  };

  if (loading) return <div className="p-4">Loading...</div>;

  // List of dynamic API fields
  const apiFields = form.fields.map((f) => f.apiField);

  // Auto-render other fields from data (fullName, email, etc)
  const otherFields = Object.keys(record)
    .filter(
      (k) =>
        !["meta", "profileImage", "passwordHash", "userId", "managerName", "roleName"].includes(k) &&
        !apiFields.includes(k)
    );

  const getImageSrc = (img) => {
	  if (!img) return null;

	  // CASE C: Only base64 (missing prefix)
	  if (img.length > 50 && !img.startsWith("data:image")) {
		return "data:image/jpeg;base64," + img;
	  }

	  // CASE D: backend path
	  if (img.startsWith("uploads") || img.startsWith("profile")) {
		return "http://localhost:8080/" + img;
	  }

	  // CASE B: correct full data URL
	  return img;
	};

  return (
    <div className="container">

      {module && (
        <PageHeader module={module} mapApiToRoute={mapApiToRoute} />
      )}

      <h3 className="text-center">Edit User</h3>

      <div className="card p-4 mt-3">

        {/* RENDER FIELDS FROM API */}
        {form.fields.map((f) => {
          const value = record[f.apiField] || "";

          if (f.fieldType === "select") {
            return (
              <div className="mb-3" key={f.apiField}>
                <label className="form-label">{f.displayLabel}</label>
                <select
                  className="form-select"
                  value={value}
                  onChange={(e) => updateField(f.apiField, e.target.value)}
                >
                  <option value="">Select {f.displayLabel}</option>
                  {f.lookupData.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.value}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          return (
            <div className="mb-3" key={f.apiField}>
              <label className="form-label">{f.displayLabel}</label>
              <input
                type="text"
                className="form-control"
                value={value}
                onChange={(e) => updateField(f.apiField, e.target.value)}
              />
            </div>
          );
        })}

        {/* AUTO-RENDER OTHER FIELDS (fullName, email, mobile, address etc) */}
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

        {/* PROFILE IMAGE UPLOAD */}
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
				style={{ width: "120px", height: "120px", objectFit: "cover" }}
			  />
			)}
        </div>

        {/* META EDITOR */}
        <h5 className="mt-4">Meta Fields</h5>

        {/* Input row for new meta */}
        <div className="row mb-3">
          <div className="col">
            <input
              type="text"
              placeholder="Key"
              className="form-control"
              value={newMeta.key}
              onChange={(e) =>
                setNewMeta((prev) => ({ ...prev, key: e.target.value }))
              }
            />
          </div>
          <div className="col">
            <input
              type="text"
              placeholder="Value"
              className="form-control"
              value={newMeta.value}
              onChange={(e) =>
                setNewMeta((prev) => ({ ...prev, value: e.target.value }))
              }
            />
          </div>
          <div className="col-auto">
            <button className="btn btn-primary" onClick={addMetaRow}>
              + Add
            </button>
          </div>
        </div>

        {/* Existing meta entries */}
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
              <button
                className="btn btn-danger"
                onClick={() => removeMetaRow(i)}
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {/* BUTTONS */}
        <div className="d-flex justify-content-center gap-2 mt-4">
          <button className="btn btn-success" onClick={handleSubmit}>
            Save
          </button>

          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
