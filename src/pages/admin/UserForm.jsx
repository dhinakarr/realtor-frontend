import React, { useState, useEffect } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function UserForm({ mode, initialData, userId }) {
  const [record, setRecord] = useState(initialData);
  const [imageFile, setImageFile] = useState(null);
  const [metaList, setMetaList] = useState(
    Object.entries(initialData.meta || {}).map(([key, value]) => ({ key, value }))
  );

  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    API.get("/api/roles", { headers: { Authorization: `Bearer ${token}` }})
      .then(res => setRoles(res.data.data));

    API.get("/api/users", { headers: { Authorization: `Bearer ${token}` }})
      .then(res => setUsers(res.data.data.data || []));
  }, []);

  const handleMetaChange = (index, field, value) => {
    const updated = [...metaList];
    updated[index][field] = value;
    setMetaList(updated);
  };

  const addMeta = () => {
    setMetaList([...metaList, { key: "", value: "" }]);
  };

  const handleSubmit = () => {
    const formData = new FormData();
	const dto = { ...record };

    // Meta object
    const metaObj = {};
    metaList.forEach(m => {
      if (m.key.trim()) metaObj[m.key] = m.value;
    });
    dto.meta = metaObj;
	formData.append("dto", new Blob([JSON.stringify(dto)], { type: "application/json" }));

    // Image
    if (imageFile) formData.append("profileImage", imageFile);

    const request = mode === "create"
      ? API.post("/api/users", formData, { headers: { "Content-Type": "multipart/form-data" }})
      : API.patch(`/api/users/${userId}`, formData, { headers: { "Content-Type": "multipart/form-data" }});

    request
      .then(() => navigate("/admin/users"))
      .catch(err => console.error(err));
  };

  return (
    <div className="card shadow p-4">
      <h4 className="mb-3">
        {mode === "create" ? "Create User" : "Edit User"}
      </h4>

      <div className="row">

        {/* Full Name */}
        <div className="col-md-6 mb-3">
          <label>Full Name</label>
          <input
            className="form-control"
            value={record.fullName}
            onChange={(e) => setRecord({ ...record, fullName: e.target.value })}
          />
        </div>

        {/* Email */}
        <div className="col-md-6 mb-3">
          <label>Email</label>
          <input
            className="form-control"
            value={record.email}
            onChange={(e) => setRecord({ ...record, email: e.target.value })}
          />
        </div>

        {/* Mobile */}
        <div className="col-md-6 mb-3">
          <label>Mobile</label>
          <input
            className="form-control"
            value={record.mobile}
            onChange={(e) => setRecord({ ...record, mobile: e.target.value })}
          />
        </div>

        {/* Role */}
        <div className="col-md-6 mb-3">
          <label>Role</label>
          <select
            className="form-control"
            value={record.roleId}
            onChange={(e) => setRecord({ ...record, roleId: e.target.value })}
          >
            <option value="">Select Role</option>
            {roles.map((r) => (
              <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
            ))}
          </select>
        </div>

        {/* Manager */}
        <div className="col-md-6 mb-3">
          <label>Manager</label>
          <select
            className="form-control"
            value={record.managerId}
            onChange={(e) => setRecord({ ...record, managerId: e.target.value })}
          >
            <option value="">Select Manager</option>
			  {(field.lookupData || []).map(opt => (
				<option key={opt.key} value={opt.key}>{opt.value}</option>
			  ))}
          </select>
        </div>

        {/* Address */}
        <div className="col-md-12 mb-3">
          <label>Address</label>
          <textarea
            className="form-control"
            value={record.address}
            onChange={(e) => setRecord({ ...record, address: e.target.value })}
          />
        </div>

        {/* Profile Image */}
        <div className="col-md-6 mb-3">
          <label>Profile Image</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          {record.profileImage && (
            <img
              src={`/uploads/${record.profileImage}`}
              alt="Profile"
              className="img-thumbnail mt-2"
              style={{ width: "120px" }}
            />
          )}
        </div>

        {/* Meta Fields */}
        <div className="col-md-12 mt-3">
          <h5>Meta Fields</h5>

          {metaList.map((m, idx) => (
            <div key={idx} className="d-flex gap-2 mb-2">
              <input
                className="form-control"
                placeholder="Key"
                value={m.key}
                onChange={(e) => handleMetaChange(idx, "key", e.target.value)}
              />

              <input
                className="form-control"
                placeholder="Value"
                value={m.value}
                onChange={(e) => handleMetaChange(idx, "value", e.target.value)}
              />
            </div>
          ))}

          <button className="btn btn-outline-primary btn-sm" onClick={addMeta}>
            + Add Meta
          </button>
        </div>

      </div>

      {/* BUTTONS */}
      <div className="d-flex justify-content-center gap-2 mt-4">
        <button className="btn btn-success" onClick={handleSubmit}>
          {mode === "create" ? "Create User" : "Update User"}
        </button>

        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    </div>
  );
}
