import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import API from "../../api/api";
import "./CustomerEditOverlay.css";

export default function CustomerEditOverlay({ show, customerId, onClose, onUpdated }) {
  const [fields, setFields] = useState([]);
  const [customerData, setCustomerData] = useState({});
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [originalCustomerData, setOriginalCustomerData] = useState({});

  useEffect(() => {
    if (show && customerId) {
      loadForm();
    }
  }, [show, customerId]);

  const loadForm = async () => {
    try {
      const res = await API.get(`/api/customers/form/${customerId}`);

      const formFields = res.data?.data?.form?.fields || [];
      const values = res.data?.data?.data || {};

      setFields(formFields);
      setCustomerData(values);
      setOriginalCustomerData(values);

      if (values.profileImagePath) {
        setProfileImagePreview(`http://localhost:8080${values.profileImagePath}`);
      }
    } catch (err) {
      console.error("Form load error:", err);
    }
  };

  const handleInputChange = (e, apiField) => {
    setCustomerData({
      ...customerData,
      [apiField]: e.target.value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setProfileImageFile(file);
    if (file) setProfileImagePreview(URL.createObjectURL(file));
  };

  const getChangedFields = () => {
    const changed = {};
    for (const key in customerData) {
      if ((originalCustomerData[key] ?? "") !== (customerData[key] ?? "")) {
        changed[key] = customerData[key];
      }
    }
    return changed;
  };

  const handleSubmit = async () => {
    try {
      const changedFields = getChangedFields();

      const formData = new FormData();
      formData.append(
        "customer",
        new Blob([JSON.stringify(changedFields)], { type: "application/json" })
      );

      if (profileImageFile) formData.append("profileImage", profileImageFile);

      await API.patch(`/api/customers/${customerId}`, formData);
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  if (!show) return null;

  return (
    <div className="overlay-backdrop">
      <div className="overlay-panel">

        <div className="header">
          <h2>Edit Customer</h2>
          <FaTimes className="close-btn" onClick={onClose} />
        </div>

        <hr />

        <div className="content">

          <div className="form-grid">
            {fields
              .filter((f) => f.apiField !== "profileImagePath")
              .map((field) => {
                const value = customerData[field.apiField] || "";

                return (
                  <div className="form-item" key={field.apiField}>
                    <label className="label">{field.displayLabel}</label>

                    {field.fieldType === "textarea" ? (
                      <textarea
                        className="input textarea"
                        rows={3}
                        value={value}
                        onChange={(e) => handleInputChange(e, field.apiField)}
                      ></textarea>
                    ) : field.fieldType === "radio" ? (
                      field.lookupData?.map((opt) => (
                        <div className="radio-row" key={opt.key}>
                          <input
                            type="radio"
                            checked={value === opt.key}
                            onChange={() =>
                              setCustomerData({
                                ...customerData,
                                [field.apiField]: opt.key,
                              })
                            }
                          />
                          <label className="radio-label">{opt.label}</label>
                        </div>
                      ))
                    ) : (
                      <input
                        type={field.fieldType}
                        className="input"
                        value={value}
                        onChange={(e) => handleInputChange(e, field.apiField)}
                      />
                    )}
                  </div>
                );
              })}
          </div>

          {/* PROFILE IMAGE */}
          <div className="profile-block">
            <h4 className="section-title">Profile Image</h4>

            {profileImagePreview ? (
              <img src={profileImagePreview} className="profile-img" />
            ) : (
              <p className="no-image">No image available</p>
            )}

            <input type="file" className="file-input" onChange={handleImageUpload} />
          </div>

          <div className="btn-row">
            <button className="btn cancel" onClick={onClose}>Cancel</button>
            <button className="btn save" onClick={handleSubmit}>Save Changes</button>
          </div>

        </div>
      </div>
    </div>
  );
}
