import React, { useState } from "react";
import API from "../api/api";

export default function FeatureForm({ item, onClose, onSave }) {
  const [formData, setFormData] = useState(item);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (item.id) {
        res = await API.put(`/api/${item.id}`, formData);
      } else {
        res = await API.post("/api/create", formData);
      }
      onSave(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3 p-3 border rounded">
      {Object.keys(formData || {}).map((key) => (
        <div className="mb-2" key={key}>
          <label>{key}</label>
          <input
            type={key.toLowerCase().includes("file") ? "file" : "text"}
            name={key}
            value={formData[key]}
            onChange={handleChange}
            className="form-control"
          />
        </div>
      ))}
      <button className="btn btn-success me-2">Save</button>
      <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
    </form>
  );
}
