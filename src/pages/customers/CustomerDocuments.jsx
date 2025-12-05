import React, { useEffect, useState } from "react";
import API from "../../api/api";
import "./CustomerOverlay.css";

export default function CustomerDocuments({ show, customerId, onClose, onUpdated }) {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [documents, setDocuments] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------------
  // Load Form Definition
  // ---------------------------------------------------
  const loadFormDefinition = async () => {
    try {
      const res = await API.get("/api/customers/form-definitions");
      setFields(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load form definition:", err);
    }
  };

  // ---------------------------------------------------
  // Load Customer Data
  // ---------------------------------------------------
  const loadCustomerData = async () => {
    try {
      const res = await API.get(`/api/customers/${customerId}`);
      const data = res.data?.data?.data || {};

      setFormData(data);
      setDocuments(data.documents || []);

      // Set profile preview if exists
      if (data.profileImageUrl) {
        setPreviewImage(data.profileImageUrl);
      }
    } catch (err) {
      console.error("Failed to load customer:", err);
    }
  };

  // ---------------------------------------------------
  // Trigger loading when overlay opens
  // ---------------------------------------------------
  useEffect(() => {
    if (show && customerId) {
      loadFormDefinition();
      loadCustomerData();
    }
  }, [show, customerId]);

  // ---------------------------------------------------
  // Handle Input Change
  // ---------------------------------------------------
  const handleInput = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ---------------------------------------------------
  // Handle Profile Image Selection
  // ---------------------------------------------------
  const handleProfileImage = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  // ---------------------------------------------------
  // Add New Documents
  // ---------------------------------------------------
  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    setDocuments((prev) => [...prev, ...files]);
  };

  // ---------------------------------------------------
  // Remove Document (client-side only)
  // ---------------------------------------------------
  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------------------------------------------------
  // Submit Update
  // ---------------------------------------------------
  const handleUpdate = async () => {
    setLoading(true);

    try {
      const form = new FormData();

      // Append base fields
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== null && val !== undefined) {
          form.append(key, val);
        }
      });

      // Append profile image if selected
      if (profileImage) {
        form.append("profileImage", profileImage);
      }

      // Append documents
      documents.forEach((doc) => {
        // If doc is a File, upload it; else skip (existing docs)
        if (doc instanceof File) {
          form.append("documents", doc);
        }
      });

      await API.patch(`/api/customers/${customerId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onUpdated(); // refresh list
      onClose(); // close panel
    } catch (err) {
      console.error("Failed to update customer:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-slide show" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-header">
          <h4>Edit Customer</h4>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="overlay-content">

          {/* Profile Image */}
          <div className="mb-3 text-center">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Profile"
                style={{ width: "120px", height: "120px", borderRadius: "10px", objectFit: "cover" }}
              />
            ) : (
              <div className="no-image">No Image</div>
            )}
            <input type="file" className="form-control mt-2" onChange={handleProfileImage} />
          </div>

          {/* Dynamic Fields */}
          <div className="row">
            {fields.map((f) => (
              <div className="col-md-6 mb-3" key={f.apiField}>
                <label className="form-label">{f.label}</label>
                <input
                  className="form-control"
                  type={f.type || "text"}
                  value={formData[f.apiField] || ""}
                  onChange={(e) => handleInput(f.apiField, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Documents */}
          <div className="mt-4">
            <h6>Documents</h6>

            {/* Existing + New docs list */}
            {documents.length > 0 && (
              <ul className="list-group mb-2">
                {documents.map((doc, i) => (
                  <li key={i} className="list-group-item d-flex justify-content-between">
                    {doc.fileName || doc.name}
                    <span
                      className="text-danger"
                      style={{ cursor: "pointer" }}
                      onClick={() => removeDocument(i)}
                    >
                      Delete
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <input type="file" multiple className="form-control" onChange={handleDocumentUpload} />
          </div>

          {/* Save Button */}
          <div className="mt-4 d-flex justify-content-end">
            <button className="btn btn-primary" disabled={loading} onClick={handleUpdate}>
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
