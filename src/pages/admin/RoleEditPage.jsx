import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/api";
import PageHeader from "../../components/PageHeader";
import useModule from "../../hooks/useModule";
import { mapApiToRoute } from "../../utils/mapApiToRoute";
import DynamicFormRenderer from "../../components/DynamicFormRenderer";

export default function RoleEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const module = useModule("/api/roles");

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState({});
  const [initialData, setInitialData] = useState({});
  const [form, setForm] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    API.get(`/api/roles/editForm/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      const data = res.data.data.data || {};
      const formInfo = res.data.data.form;
      
      // Ensure checkboxes convert "true"/"false" to booleans
      formInfo.fields.forEach((f) => {
        if (f.fieldType === "checkbox") {
          data[f.apiField] =
            data[f.apiField] === true || data[f.apiField] === "true";
        }
      });

      setRecord(data);
      setForm(formInfo);
      setInitialData(data);
      setLoading(false);
    });
  }, [id]);

  const updateField = (apiField, value) => {
    setRecord((prev) => ({ ...prev, [apiField]: value }));
  };

  const handleSubmit = () => {
    const updates = {};

    Object.keys(record).forEach((key) => {
      if (record[key] !== initialData[key]) {
        updates[key] = record[key];
      }
    });

    API.patch(`/api/roles/${id}`, updates, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => navigate(`/admin/roles/view/${id}`))
      .catch((err) => console.error(err));
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="container">

      {module && (
        <PageHeader module={module} mapApiToRoute={mapApiToRoute} />
      )}

      <h3 className="text-center">Edit Role</h3>

      <div className="card p-4 mt-3">

        {/* RENDER FIELDS FROM API */}
        <DynamicFormRenderer
          form={form}
          record={record}
          updateField={updateField}
        />

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
