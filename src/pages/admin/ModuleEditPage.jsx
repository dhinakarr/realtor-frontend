import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/api";
import PageHeader from "../../components/PageHeader";
import useModule from "../../hooks/useModule";
import { mapApiToRoute } from "../../utils/mapApiToRoute";

export default function ModuleEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const module = useModule("/api/modules");

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState({});
  const [initialData, setInitialData] = useState({});
  const [form, setForm] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    API.get(`/api/modules/editForm/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      const data = res.data.data.data || {};
      const formInfo = res.data.data.form;

      setRecord(data);
      setForm(formInfo);
	  setInitialData(data);
      setLoading(false);
    });
  }, [id]);

  const updateField = (apiField, value) => {
    setRecord((prev) => ({ ...prev, [apiField]: value }));
  };

  // ========== SUBMIT ==========
  const handleSubmit = () => {
    const formData = new FormData();
    const updates = {};

	  // 1. NORMAL FIELDS
	  Object.keys(record).forEach((key) => {
		if (record[key] !== initialData[key]) {
			updates[key] = record[key];
		  }
	  });
    	
	for (const key in updates) {
		if (key === "meta") {
		  formData.append(key, updates[key]);
		}

		API.patch(`/api/modules/${id}`, updates, {
		  headers: {
			Authorization: `Bearer ${token}`,
		  }
		})
		  .then(() => navigate(`/admin/modules/view/${id}`))
		  .catch((err) => console.error(err));
    };
  }

  if (loading) return <div className="p-4">Loading...</div>;

  // List of dynamic API fields
  const apiFields = form.fields.map((f) => f.apiField);

  // Auto-render other fields from data (fullName, email, etc)
  const otherFields = Object.keys(record)
    .filter(
      (k) =>
        !["moduleId", "description", "moduleName"].includes(k) &&
        !apiFields.includes(k)
    );

  return (
    <div className="container">

      {module && (
        <PageHeader module={module} mapApiToRoute={mapApiToRoute} />
      )}

      <h3 className="text-center">Edit Module</h3>

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
